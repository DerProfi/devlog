'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations, useFormatter } from 'next-intl'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'

type ViewMode = 'week' | 'month' | 'year'

export default function ContributionsChart() {
  const t = useTranslations('github')
  const tCommon = useTranslations('common')
  const format = useFormatter()
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [weeksData, setWeeksData] = useState<any[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/github/contributions')
      const json = await res.json()
      if (json?.success && json.data) {
        // Use new API structure: data.thisYear.contributionCalendar.weeks
        const thisYear = json.data.thisYear || {}
        const calendar = thisYear.contributionCalendar || {}
        setWeeksData(Array.isArray(calendar.weeks) ? calendar.weeks : [])
      }
    }
    run()
  }, [])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const contributionMap = useMemo(() => {
    const map: Record<string, number> = {}
    weeksData.forEach((week) => {
      week.contributionDays.forEach((day: any) => {
        map[day.date] = day.contributionCount
      })
    })
    return map
  }, [weeksData])

  const chartData = useMemo(() => {
    if (weeksData.length === 0) {
      return { points: [] as { label: string; value: number }[], max: 1 }
    }

    const today = new Date()
    const getCountForDate = (date: Date) => {
      const key = date.toISOString().split('T')[0]
      return contributionMap[key] ?? 0
    }

    if (viewMode === 'week') {
      const points: { label: string; value: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        points.push({
          label: format.dateTime(date, { weekday: 'short' }),
          value: getCountForDate(date)
        })
      }
      const max = Math.max(1, ...points.map((p) => p.value))
      return { points, max }
    }

    if (viewMode === 'month') {
      const points: { label: string; value: number }[] = []
      const todayDow = today.getDay()
      const mondayOffset = todayDow === 0 ? -6 : 1 - todayDow
      const currentMonday = new Date(today)
      currentMonday.setDate(today.getDate() + mondayOffset)

      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(currentMonday)
        weekStart.setDate(currentMonday.getDate() - (i * 7))
        let total = 0
        for (let d = 0; d < 7; d++) {
          const day = new Date(weekStart)
          day.setDate(weekStart.getDate() + d)
          total += getCountForDate(day)
        }
        points.push({
          label: `${t('calendarWeek')} ${getWeekNumber(weekStart)}`,
          value: total
        })
      }
      const max = Math.max(1, ...points.map((p) => p.value))
      return { points, max }
    }

    const points: { label: string; value: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)
      let total = 0
      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
        total += getCountForDate(date)
      }
      points.push({
        label: format.dateTime(monthDate, { month: 'short' }),
        value: total
      })
    }
    const max = Math.max(1, ...points.map((p) => p.value))
    return { points, max }
  }, [viewMode, weeksData, contributionMap])

  return (
    <div className="panel p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="font-mono text-sm md:text-base" style={{ color: 'var(--dl-text)' }}>{t('contributionsHistory')}</div>
        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
          {(['week', 'month', 'year'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded-lg font-mono"
              style={{
                background: viewMode === mode ? 'var(--dl-accent)' : 'var(--dl-surface)',
                border: `1px solid ${viewMode === mode ? 'var(--dl-accent)' : 'var(--dl-border)'}`,
                color: viewMode === mode ? 'white' : 'var(--dl-text)'
              }}
            >
              {tCommon(mode)}
            </button>
          ))}
        </div>
      </div>

      {chartData.points.length === 0 ? (
        <div className="text-xs font-mono text-center" style={{ color: 'var(--dl-muted)' }}>
          {t('noContributions')}
        </div>
      ) : (
        <div style={{ height: isMobile ? 150 : 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData.points}
              margin={{ top: 10, right: isMobile ? 5 : 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="contribGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--dl-accent-2)" stopOpacity={0.65} />
                  <stop offset="100%" stopColor="var(--dl-accent-weak)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--dl-border)" strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="label"
                stroke="var(--dl-muted)"
                tick={{ fill: 'var(--dl-muted)', fontSize: isMobile ? 8 : 10 }}
                axisLine={{ stroke: 'var(--dl-border)' }}
                tickLine={{ stroke: 'var(--dl-border)' }}
              />
              <YAxis
                stroke="var(--dl-muted)"
                tick={{ fill: 'var(--dl-muted)', fontSize: isMobile ? 8 : 10 }}
                axisLine={{ stroke: 'var(--dl-border)' }}
                tickLine={{ stroke: 'var(--dl-border)' }}
                allowDecimals={false}
                domain={[0, Math.max(chartData.max, 1)]}
              />
              <Tooltip
                cursor={{ stroke: 'var(--dl-accent)', strokeOpacity: 0.2 }}
                contentStyle={{
                  background: 'var(--dl-surface)',
                  border: '1px solid var(--dl-border)',
                  borderRadius: '8px',
                  color: 'var(--dl-text)',
                  fontFamily: 'Fira Code, monospace',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'var(--dl-muted)' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--dl-accent-2)"
                strokeWidth={isMobile ? 1.5 : 2}
                fill="url(#contribGradient)"
                dot={{ r: isMobile ? 2 : 3, fill: 'var(--dl-accent-2)', strokeWidth: 0 }}
                activeDot={{ r: isMobile ? 3 : 4, stroke: 'var(--dl-accent-2)', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}


