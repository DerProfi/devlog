import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { ollama } from '@/lib/ollama'
import { checkAndConsumeQuota } from '@/lib/quotas'
import { enforceRateLimit, rateKeyFromRequest } from '@/lib/rateLimit'
import { supabaseAdmin } from '@/lib/supabase'
import {
  aggregateSummaryData,
  buildSummaryPrompt, SummaryDevLog,
  type SummaryPeriod,
  type SummaryPeriodType,
  type SummaryPromptResponse,
} from '@/lib/summary'
import type { Goal } from '@/types/goals'
import { Locale } from "@/contexts/LanguageContext";
import {LOCALES} from "@/lib/locales";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const SUMMARY_RATE_LIMIT = 5
const SUMMARY_RATE_WINDOW_SECONDS = 60
const configuredQuota = Number(process.env.SUMMARY_MONTHLY_QUOTA || 10)
const SUMMARY_MONTHLY_QUOTA = Number.isFinite(configuredQuota) && configuredQuota > 0 ? configuredQuota : 10
const SUMMARY_MODEL = process.env.OLLAMA_MODEL_NAME || 'qwen3:8b'

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function parsePeriod(value: unknown): SummaryPeriod | null {
  if (!value || typeof value !== 'object') return null
  const { type, startDate, endDate } = value as Record<string, unknown>
  if (!['week', 'month', 'custom'].includes(type as string) || !isValidDate(startDate) || !isValidDate(endDate)) return null
  if (startDate > endDate) return null
  return { type: type as SummaryPeriodType, startDate, endDate }
}

/**
 * Checks the returned JSON structure from the LLM.
 * @param value The model output.
 * @param goalIds The goal ids queried from the database.
 * @return The validated model output.
 */
function isSummaryResponse(value: unknown, goalIds: Set<string>): value is SummaryPromptResponse {
  if (!value || typeof value !== 'object' || !Array.isArray((value as SummaryPromptResponse).goalAssessments)) return false
  const assessments = (value as SummaryPromptResponse).goalAssessments
  if (assessments.length !== goalIds.size) return false

  const returnedIds = new Set<string>()
  return assessments.every((assessment) => {
    const suggestions = assessment?.focusSuggestions
    const valid = typeof assessment?.goalId === 'string'
      && goalIds.has(assessment.goalId)
      && !returnedIds.has(assessment.goalId)
      && typeof assessment?.progressAssessment === 'string'
      && assessment.progressAssessment.trim().length > 0
      && Array.isArray(suggestions)
      && suggestions.length >= 2
      && suggestions.length <= 4
      && suggestions.every((suggestion) => typeof suggestion === 'string' && suggestion.trim().length > 0)
    if (valid) returnedIds.add(assessment.goalId)
    return valid
  })
}

function parseModelJson(response: string): unknown {
  const withoutFence = response.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(withoutFence)
}

function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    // 2. Validate request body
    const body = await request.json()
    const period = parsePeriod(body?.period)
    if (!period) {
      return NextResponse.json(
        { success: false, error: 'period must include a type (week, month, or custom) and valid startDate/endDate (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    if (!isLocale(body?.language)) {
      return NextResponse.json(
          { success: false, error: `Language must be one of ${LOCALES.join(", ")}`},
          { status: 400 }
      )
    }


    // 3. Rate limit
    const rateLimit = await enforceRateLimit({
      key: `${rateKeyFromRequest(request, session.userId)}:summary`,
      limit: SUMMARY_RATE_LIMIT,
      windowSec: SUMMARY_RATE_WINDOW_SECONDS,
    })
    if (!rateLimit.ok) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSec || SUMMARY_RATE_WINDOW_SECONDS) } }
      )
    }

    // 4. Query database
    const [{ data: goals, error: goalsError }, { data: devLogs, error: devLogsError }] = await Promise.all([
      supabaseAdmin()
        .from('goals')
        .select('*')
        .eq('user_id', session.userId)
        .in('status', ['active', 'completed'])
        .lte('start_date', period.endDate)
        .gte('end_date', period.startDate),
      supabaseAdmin()
        .from('dev_logs')
        .select('date, mood, learnings, tasks')
        .eq('user_id', session.userId)
        .gte('date', period.startDate)
        .lte('date', period.endDate)
        .order('date', { ascending: true }),
    ])
    if (goalsError) throw goalsError
    if (devLogsError) throw devLogsError
    if (!goals?.length) {
      return NextResponse.json(
        { success: false, error: 'No active or completed goals overlap the requested period.' },
        { status: 422 }
      )
    }

    // 5. Check quota usage
    const quota = await checkAndConsumeQuota({
      userId: session.userId,
      action: 'summary_generate',
      period: 'month',
      limit: SUMMARY_MONTHLY_QUOTA,
    })
    if (!quota.ok) {
      return NextResponse.json(
        { success: false, error: `Monthly summary quota reached (${quota.limit}).` },
        { status: 403 }
      )
    }

    // 6. Aggregate the data, build the prompt, ask the LLM.
    const summaryData = aggregateSummaryData(period, goals as Goal[], devLogs as SummaryDevLog[])
    const { prompt, schema } = buildSummaryPrompt(summaryData, body.language);
    const modelResponse = await ollama.generate({
      model: SUMMARY_MODEL,
      prompt,
      format: schema,
      stream: false,
      options: { temperature: 0.2 },
    })

    // 7. Process model output
    let result: unknown
    try {
      result = parseModelJson(modelResponse.response)
    } catch {
      return NextResponse.json({ success: false, error: 'The summary provider returned invalid JSON.' }, { status: 502 })
    }
    if (!isSummaryResponse(result, new Set(summaryData.goals.map(({ goal }) => goal.id)))) {
      return NextResponse.json({ success: false, error: 'The summary provider returned an invalid summary structure.' }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        goalAssessments: result.goalAssessments,
        goals: summaryData.goals.map(({ goal }) => ({ id: goal.id, name: goal.name })),
      },
    })
  } catch (error) {
    console.error('Generate summary error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate summary.' }, { status: 500 })
  }
}
