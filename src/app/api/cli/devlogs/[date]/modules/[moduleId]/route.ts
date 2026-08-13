import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit, rateKeyFromRequest } from '@/lib/rateLimit'
import { checkAndConsumeQuota } from '@/lib/quotas'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticateCLI, createSuccessResponse, createErrorResponse } from '@/lib/cliAuth'

// Valid module IDs
const VALID_MODULES = [
  'goals', 'achieved', 'problems', 'learnings', 'mood',
  'code_snippets', 'meetings', 'resources', 'next_steps',
  'challenges', 'accomplishments', 'time_tracking', 'tools_used',
  'reflection', 'github_activity'
]

// PATCH - Update specific module
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ date: string; moduleId: string }> }
) {
  const { user, error } = await authenticateCLI(request)

  if (error || !user) {
    return NextResponse.json(
      createErrorResponse(error || 'Authentication failed', 'UNAUTHORIZED'),
      { status: 401 }
    )
  }


  // 1) Rate limit: 60 requests / 60s per user (fallback IP if no user)
  const rl = await enforceRateLimit({
    key: rateKeyFromRequest(request as unknown as Request, user?.id),
    limit: 60,
    windowSec: 60
  })
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: { message: `Rate limit exceeded. Try again later.`, code: 'RATE_LIMIT' } },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 60) } }
    )
  }

  // 2) Quota: at most 100 devlog writes per day
  const quota = await checkAndConsumeQuota({
    userId: user.id,
    action: 'devlog_write',
    period: 'day',
    limit: 100
  })
  if (!quota.ok) {
    return NextResponse.json(
      { success: false, error: { message: `Daily quota reached (${quota.limit})`, code: 'QUOTA_EXCEEDED' } },
      { status: 403 }
    )
  }

  try {
    const { date, moduleId } = await context.params
    const body = await request.json()
    const { content, action } = body

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        createErrorResponse('Invalid date format. Use YYYY-MM-DD', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    // Validate module ID
    if (!VALID_MODULES.includes(moduleId)) {
      return NextResponse.json(
        createErrorResponse(
          `Invalid module ID. Valid modules: ${VALID_MODULES.join(', ')}`,
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      )
    }

    // Validate action
    if (action && !['append', 'replace'].includes(action)) {
      return NextResponse.json(
        createErrorResponse('Invalid action. Use "append" or "replace"', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    // Validate content
    if (content === undefined || content === null) {
      return NextResponse.json(
        createErrorResponse('Content is required', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    // Get existing log
    const { data: existingLog } = await supabaseAdmin()
      .from('dev_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single()

    let devLog

    if (existingLog) {
      // Update existing module
      const currentModules = existingLog.modules || {}
      const currentContent = currentModules[moduleId] || ''

      let newContent
      if (action === 'replace') {
        newContent = content
      } else {
        // Default to append
        if (typeof currentContent === 'string') {
          newContent = currentContent ? `${currentContent}\n${content}` : content
        } else {
          // For non-string modules (like mood), replace
          newContent = content
        }
      }

      const updatedModules = {
        ...currentModules,
        [moduleId]: newContent
      }

      const { data, error: updateError } = await supabaseAdmin()
        .from('dev_logs')
        .update({ modules: updatedModules })
        .eq('id', existingLog.id)
        .select()
        .single()

      if (updateError) throw updateError
      devLog = data
    } else {
      // Create new log with this module
      const { data, error: insertError } = await supabaseAdmin()
        .from('dev_logs')
        .insert({
          user_id: user.id,
          date,
          title: `${new Date(date).toLocaleDateString('de-DE')} – Daily Dev Log`,
          modules: { [moduleId]: content },
          tags: [],
          is_public: false,
          template: 'comprehensive'
        })
        .select()
        .single()

      if (insertError) throw insertError
      devLog = data
    }

    return NextResponse.json(
      createSuccessResponse({
        devLog,
        updatedModule: {
          moduleId,
          content: devLog.modules[moduleId],
          action: action || 'append'
        }
      })
    )

  } catch (error) {
    console.error('CLI PATCH module error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to update module', 'UPDATE_ERROR'),
      { status: 500 }
    )
  }
}
