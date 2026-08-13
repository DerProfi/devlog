'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'

type Summary = {
  commits: number
  pullRequests: number
  issues: number
  reviews: number
  repositories: number
  totalContributions: number
  currentStreak: number
  longestStreak: number
  averagePerWeek: number
}

type Metrics = {
  commitsToday: number
  prsCreatedToday: number
  prReviewsToday: number
  commitsThisWeek: number
  prsCreatedThisWeek: number
  prReviewsThisWeek: number
  totalContributionsThisYear: number
  totalContributionsLastYear: number
  avgContributionsPerDayThisYear: number
  avgContributionsPerDayLastYear: number
}

export default function DashboardStatsSummary() {
  const { user } = useAuth()
  const t = useTranslations('dashboard')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    const run = async () => {
      setLoading(true)
      try {
        const sumRes = await fetch('/api/github/contributions')
        const sumJson = await sumRes.json()
        if (sumJson?.success && sumJson.data) {
          const data = sumJson.data
          const metricsData = data.metrics || {}
          const thisYear = data.thisYear
          const cal = thisYear?.contributionCalendar

          const streakData = calcStreak(cal?.weeks || [])
          setSummary({
            commits: thisYear?.totalCommitContributions || 0,
            pullRequests: thisYear?.totalPullRequestContributions || 0,
            issues: thisYear?.totalIssueContributions || 0,
            reviews: thisYear?.totalPullRequestReviewContributions || 0,
            repositories: thisYear?.totalRepositoryContributions || 0,
            totalContributions: metricsData.totalContributionsThisYear || cal?.totalContributions || 0,
            currentStreak: streakData.current,
            longestStreak: streakData.longest,
            averagePerWeek: Math.floor((metricsData.totalContributionsThisYear || 0) / 52)
          })

          setMetrics({
            commitsToday: metricsData.commitsToday || 0,
            prsCreatedToday: metricsData.prsCreatedToday || 0,
            prReviewsToday: metricsData.prReviewsToday || 0,
            commitsThisWeek: metricsData.commitsThisWeek || 0,
            prsCreatedThisWeek: metricsData.prsCreatedThisWeek || 0,
            prReviewsThisWeek: metricsData.prReviewsThisWeek || 0,
            totalContributionsThisYear: metricsData.totalContributionsThisYear || 0,
            totalContributionsLastYear: metricsData.totalContributionsLastYear || 0,
            avgContributionsPerDayThisYear: metricsData.avgContributionsPerDayThisYear || 0,
            avgContributionsPerDayLastYear: metricsData.avgContributionsPerDayLastYear || 0,
          })
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user])

  const avgPerDay = useMemo(() => {
    if (!summary) return 0
    return Math.round((summary.averagePerWeek / 7) * 10) / 10
  }, [summary])

  const contributionsChange = useMemo(() => {
    if (!metrics || metrics.totalContributionsLastYear === 0) return { percent: 0, direction: '' }
    const change = ((metrics.totalContributionsThisYear - metrics.totalContributionsLastYear) / metrics.totalContributionsLastYear) * 100
    return {
      percent: Math.abs(Math.round(change)),
      direction: change > 0 ? '↑' : change < 0 ? '↓' : ''
    }
  }, [metrics])

  const avgPerDayChange = useMemo(() => {
    if (!metrics || metrics.avgContributionsPerDayLastYear === 0) return { percent: 0, direction: '' }
    const change = ((metrics.avgContributionsPerDayThisYear - metrics.avgContributionsPerDayLastYear) / metrics.avgContributionsPerDayLastYear) * 100
    return {
      percent: Math.abs(Math.round(change)),
      direction: change > 0 ? '↑' : change < 0 ? '↓' : ''
    }
  }, [metrics])

  const streakProgress = useMemo(() => {
    if (!summary) return { current: 0, target: 7, progress: 0, milestoneIndex: 0 }

    const milestones = [7, 14, 30, 50, 100]
    const currentStreak = summary.currentStreak

    // Finde den aktuellen Meilenstein
    let milestoneIndex = 0
    for (let i = 0; i < milestones.length; i++) {
      if (currentStreak < milestones[i]) {
        milestoneIndex = i
        break
      }
      if (i === milestones.length - 1) {
        milestoneIndex = i
      }
    }

    const target = milestones[milestoneIndex]
    const previousMilestone = milestoneIndex > 0 ? milestones[milestoneIndex - 1] : 0
    const progress = ((currentStreak - previousMilestone) / (target - previousMilestone)) * 100

    return {
      current: currentStreak,
      target,
      progress: Math.min(progress, 100),
      milestoneIndex
    }
  }, [summary])

  if (!user) {
    return (
      <div className="panel p-6">
        <div className="text-center font-mono" style={{ color: 'var(--dl-muted)' }}>{t('loginToSeeStats')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <div className="panel p-5 relative group/streak">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs font-mono mb-1 flex items-center gap-1" style={{ color: 'var(--dl-muted)' }}>
              {t('currentStreak')}
              <button type="button" className="relative group/info cursor-help" tabIndex={0}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div
                  className="absolute left-0 top-full mt-2 p-2 rounded-md text-xs font-mono opacity-0 pointer-events-none group-hover/info:opacity-100 group-focus/info:opacity-100 transition-opacity z-20 w-[calc(100vw-3rem)] max-w-50"
                  style={{
                    background: 'var(--dl-surface-2)',
                    border: '1px solid var(--dl-border)',
                    color: 'var(--dl-text)'
                  }}
                >
                  {t('tooltips.streak')}
                </div>
              </button>
            </div>
            <div className="text-3xl font-bold font-mono" style={{ color: 'var(--dl-accent)' }}>
              {loading || !summary ? '-' : streakProgress.current} {t('days')}
            </div>
            <div className="text-xs font-mono mt-1" style={{ color: 'var(--dl-muted)' }}>
              {t('record')} {loading || !summary ? '-' : summary.longestStreak}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>{t('nextGoal')}</div>
            <div className="text-sm font-mono" style={{ color: 'var(--dl-accent-2)' }}>
              {loading || !summary ? '-' : streakProgress.target}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--dl-surface)' }}>
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${loading || !summary ? 0 : streakProgress.progress}%`,
                background: 'linear-gradient(90deg, var(--dl-accent), var(--dl-accent-2))'
              }}
            />
          </div>
          <div className="text-xs font-mono mt-1 text-center" style={{ color: 'var(--dl-muted)' }}>
            {loading || !summary ? '-' : t('daysText', { count: `${streakProgress.current} / ${streakProgress.target}` })}
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {[7, 14, 30, 50, 100].map((d, idx) => {
            const completed = summary && summary.currentStreak >= d
            const isCurrent = !loading && summary && streakProgress.milestoneIndex === idx
            return (
              <button
                key={d}
                className="px-2 py-1 text-xs rounded-md font-mono transition-all"
                style={{
                  background: completed ? 'var(--dl-accent-weak)' : 'var(--dl-surface)',
                  border: `2px solid ${isCurrent ? 'var(--dl-accent-2)' : completed ? 'var(--dl-accent)' : 'var(--dl-border)'}`,
                  color: completed ? 'var(--dl-accent-2)' : 'var(--dl-text)',
                  fontWeight: isCurrent ? 'bold' : 'normal'
                }}
              >
                {d} {t('days')}
              </button>
            )
          })}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <Metric
          title={t('commitsToday')}
          value={loading || !metrics ? '-' : metrics.commitsToday}
          tooltip={t('tooltips.commitsToday')}
          accent
        />
        <Metric
          title={t('prsWeek')}
          value={loading || !metrics ? '-' : metrics.prsCreatedThisWeek}
          subtitle={t('created')}
          tooltip={t('tooltips.prsWeek')}
          accent
        />
        <Metric
          title={t('reviewsWeek')}
          value={loading || !metrics ? '-' : metrics.prReviewsThisWeek}
          tooltip={t('tooltips.reviewsWeek')}
          accent
        />
        <Metric
          title={t('commitsWeek')}
          value={loading || !metrics ? '-' : metrics.commitsThisWeek}
          tooltip={t('tooltips.commitsWeek')}
          accent
        />
        <Metric
          title={t('contributions')}
          value={loading || !metrics ? '-' : metrics.totalContributionsThisYear}
          subtitle={loading || !metrics ? '' : contributionsChange.direction ? `${contributionsChange.direction}${contributionsChange.percent}% ${t('vsLastYear')}` : `${metrics.totalContributionsLastYear} ${t('lastYear')}`}
          tooltip={t('tooltips.contributions')}
          accent
          strong
        />
        <Metric
          title={t('avgPerDay')}
          value={loading || !metrics ? '-' : metrics.avgContributionsPerDayThisYear}
          subtitle={loading || !metrics ? '' : avgPerDayChange.direction ? `${avgPerDayChange.direction}${avgPerDayChange.percent}% ${t('vsLastYear')}` : `${metrics.avgContributionsPerDayLastYear} ${t('lastYear')}`}
          tooltip={t('tooltips.avgPerDay')}
          accent
          strong
        />
      </div>
    </div>
  )
}

function Metric({ title, value, subtitle, accent, strong, tooltip }: {
  title: string
  value: string | number
  subtitle?: string
  accent?: boolean
  strong?: boolean
  tooltip?: string
}) {
  return (
    <div
      className="metric-card relative group"
      title={tooltip}
    >
      <div
        className={`font-bold font-mono ${strong ? 'text-2xl' : 'text-xl'}`}
        style={{ color: accent ? (strong ? 'var(--dl-accent)' : 'var(--dl-accent-2)') : 'var(--dl-text)' }}
      >
        {value}
      </div>
      <div className="text-[11px] font-mono mt-1" style={{ color: 'var(--dl-muted)' }}>{title}</div>
      {subtitle && (
        <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--dl-muted)' }}>{subtitle}</div>
      )}
      {tooltip && (
        <div
          className="absolute left-0 right-0 bottom-full mb-2 p-2 rounded-md text-xs font-mono opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 whitespace-pre-line"
          style={{
            background: 'var(--dl-surface-2)',
            border: '1px solid var(--dl-border)',
            color: 'var(--dl-text)'
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  )
}

function calcStreak(weeks: any[]): { current: number; longest: number } {
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  const today = new Date()
  let foundFirstContribution = false

  // Calculate current streak (from today backwards)
  for (const week of [...weeks].reverse()) {
    for (const day of [...week.contributionDays].reverse()) {
      const d = new Date(day.date)
      if (d > today) continue
      if (day.contributionCount > 0) {
        currentStreak++
        foundFirstContribution = true
      } else if (foundFirstContribution) {
        break
      }
    }
    if (foundFirstContribution && currentStreak > 0) {
      // Check if we hit a gap
      const lastDay = [...weeks].reverse().find(w =>
        w.contributionDays.some((d: any) => new Date(d.date) <= today && d.contributionCount === 0)
      )
      if (lastDay) break
    }
  }

  // Recalculate current streak properly
  currentStreak = 0
  for (const week of [...weeks].reverse()) {
    let shouldBreak = false
    for (const day of [...week.contributionDays].reverse()) {
      const d = new Date(day.date)
      if (d > today) continue
      if (day.contributionCount > 0) currentStreak++
      else if (currentStreak > 0) {
        shouldBreak = true
        break
      }
    }
    if (shouldBreak) break
  }

  // Calculate longest streak (iterate through all days)
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }
  }

  return { current: currentStreak, longest: Math.max(longestStreak, currentStreak) }
}


