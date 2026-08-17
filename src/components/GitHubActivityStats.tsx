'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { GitHubActivitySummary, GitHubWeek, GitHubContributionDay } from '@/types/githubActivity'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations, useFormatter } from 'next-intl'
import Button from './ui/Button'
import { FaLock, FaTimesCircle } from 'react-icons/fa'

export default function GitHubActivityStats() {
  const { user } = useAuth()
  const t = useTranslations('github')
  const format = useFormatter()
  const [stats, setStats] = useState<GitHubActivitySummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devLogDates, setDevLogDates] = useState<Set<string>>(new Set())
  const calendarRef = useRef<HTMLDivElement>(null)

  // Auto-scroll calendar to the right (most recent week) when stats are loaded
  useEffect(() => {
    if (stats && calendarRef.current) {
      calendarRef.current.scrollLeft = calendarRef.current.scrollWidth
    }
  }, [stats])

  const fetchStats = useCallback(async () => {
    if (!user?.username) return
    
    setLoading(true)
    setError(null)

    try {
      // Call our server-side API that uses the server token
      const response = await fetch('/api/github/contributions')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch contributions')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Transform the data to our stats format
        const data = result.data
        const thisYear = data.thisYear || {}
        const lastYear = data.lastYear || {}
        const calendar = (thisYear.contributionCalendar || { weeks: [], totalContributions: 0 })
        const metrics = data.metrics || {}
        
        // Ensure weeks is an array
        const weeks = Array.isArray(calendar.weeks) ? calendar.weeks : []
        
        const activityStats = {
          commits: thisYear.totalCommitContributions || 0,
          pullRequests: thisYear.totalPullRequestContributions || 0,
          issues: thisYear.totalIssueContributions || 0,
          reviews: thisYear.totalPullRequestReviewContributions || 0,
          repositories: thisYear.totalRepositoryContributions || 0,
          totalContributions: calendar.totalContributions || 0,
          currentStreak: calculateStreak(weeks),
          longestStreak: calculateLongestStreak(weeks),
          contributionsThisYear: metrics.totalContributionsThisYear || calendar.totalContributions || 0,
          contributionsLastYear: metrics.totalContributionsLastYear || 0,
          averagePerWeek: metrics.avgContributionsPerDayThisYear ? Math.round(metrics.avgContributionsPerDayThisYear * 7) : Math.floor(calendar.totalContributions / 52),
          mostActiveDay: getMostActiveDayFromWeeks(weeks),
          contributionGraph: buildGraphFromWeeks(weeks)
        }
        
        setStats(activityStats)
        await fetchDevLogDates()
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity stats')
    } finally {
      setLoading(false)
    }
  }, [user?.username])

  useEffect(() => {
    if (user?.username) {
      fetchStats()
      fetchDevLogDates()
    }
  }, [user, fetchStats])

  const fetchDevLogDates = async () => {
    try {
      const response = await fetch('/api/devlogs?limit=365')
      const json = await response.json()
      if (json?.success && Array.isArray(json.data?.devLogs)) {
        const dates = new Set<string>()
        json.data.devLogs.forEach((log: { date: string }) => {
          if (log?.date) {
            dates.add(new Date(log.date).toISOString().split('T')[0])
          }
        })
        setDevLogDates(dates)
      }
    } catch (err) {
      console.error('Error fetching dev log overview:', err)
    }
  }

  const calculateStreak = (weeks: GitHubWeek[]) => {
    if (!weeks || weeks.length === 0) return 0
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Create a map of dates to contribution counts for quick lookup
    const contributionsByDate = new Map<string, number>()
    weeks.forEach((week: GitHubWeek) => {
      week.contributionDays.forEach((day: GitHubContributionDay) => {
        contributionsByDate.set(day.date, day.contributionCount)
      })
    })
    
    // Count consecutive days with contributions starting from today
    const checkDate = new Date(today)
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0]
      const count = contributionsByDate.get(dateStr) || 0
      
      if (count > 0) {
        streak++
        // Move to previous day
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        // No contributions on this day, streak is broken
        break
      }
      
      // Safety check: don't go back more than 2 years
      if (streak > 730) break
    }
    
    return streak
  }

  const calculateLongestStreak = (weeks: GitHubWeek[]) => {
    if (!weeks || weeks.length === 0) return 0

    let longestStreak = 0
    let currentStreak = 0

    // Create a map of dates to contribution counts for quick lookup
    const contributionsByDate = new Map<string, number>()
    weeks.forEach((week: GitHubWeek) => {
      week.contributionDays.forEach((day: GitHubContributionDay) => {
        contributionsByDate.set(day.date, day.contributionCount)
      })
    })

    const sortedDates = Array.from(contributionsByDate.keys()).sort()

    let prevDate : Date | null = null

    for (const dateStr of sortedDates) {
      const count = contributionsByDate.get(dateStr) || 0
      const currentDate = new Date(dateStr)

      // count only dates with contributions
      if (count > 0) {
        if (prevDate) {
          const diffInDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)

          // if the days are after each other -> raise counter
          if (diffInDays === 1) {
            currentStreak++
          } else {
            // break in the streak -> start over on 1
            currentStreak = 1
          }
        } else {
          // first counting day
          currentStreak = 1
        }

        prevDate = currentDate
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        // no contributions -> break streak
        currentStreak = 0
        prevDate = null
      }
    }

    return longestStreak
}

  const getMostActiveDayFromWeeks = (weeks: GitHubWeek[]) => {
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]

    weeks.forEach((week: GitHubWeek) => {
      week.contributionDays.forEach((day: GitHubContributionDay) => {
        dayCounts[day.weekday] += day.contributionCount
      })
    })

    const days = [
      t('days.sunday'),
      t('days.monday'),
      t('days.tuesday'),
      t('days.wednesday'),
      t('days.thursday'),
      t('days.friday'),
      t('days.saturday')
    ]
    const maxIndex = dayCounts.indexOf(Math.max(...dayCounts))
    return days[maxIndex]
  }

  const buildGraphFromWeeks = (weeks: GitHubWeek[]) => {
    const graph: { [date: string]: number } = {}
    weeks.forEach((week: GitHubWeek) => {
      week.contributionDays.forEach((day: GitHubContributionDay) => {
        graph[day.date] = day.contributionCount
      })
    })
    return graph
  }

  const getContributionLevel = (count: number) => {
    if (count === 0) return { level: 0, label: t('contributionLevels.none'), color: 'var(--dl-surface)' }
    if (count <= 3) return { level: 1, label: t('contributionLevels.low'), color: 'var(--dl-accent-weak)' }
    if (count <= 6) return { level: 2, label: t('contributionLevels.medium'), color: 'var(--dl-accent)' }
    if (count <= 9) return { level: 3, label: t('contributionLevels.high'), color: 'var(--dl-accent-2)' }
    return { level: 4, label: t('contributionLevels.veryHigh'), color: 'var(--dl-accent-3)' }
  }

  const renderContributionCalendar = () => {
    if (!stats) return null

    // Generate calendar starting from Monday (weekday 1)
    const weeks = []
    const today = new Date()
    
    // Start from 52 weeks ago, but adjust to start from Monday
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - (52 * 7))
    
    // Adjust to start from Monday (weekday 1)
    const dayOfWeek = startDate.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Sunday = 0, Monday = 1
    startDate.setDate(startDate.getDate() - mondayOffset)
    
    for (let week = 0; week < 53; week++) {
      const weekDays = []
      
      // Start from Monday (j=0) and go to Sunday (j=6)
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + (week * 7) + day)
        
        // Skip future dates
        if (date > today) {
          weekDays.push(
            <div
              key={`${week}-${day}`}
              className="w-3 h-3 bg-transparent rounded-sm"
            />
          )
          continue
        }
        
        // Get contribution count from stats or use 0
        const dateStr = date.toISOString().split('T')[0]
        const contributionCount = stats.contributionGraph[dateStr] || 0
        const { color } = getContributionLevel(contributionCount)
        const hasDevLog = devLogDates.has(dateStr)
        
        weekDays.push(
          <div
            key={`${week}-${day}`}
            className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm border transition-colors"
            style={{
              background: color,
              borderColor: hasDevLog ? 'var(--dl-accent-border)' : 'var(--dl-border)',
              borderWidth: hasDevLog ? '2px' : '1px'
            }}
            title={`${format.dateTime(date, { day: '2-digit', month: '2-digit', year: 'numeric' })}: ${contributionCount} contribution${contributionCount !== 1 ? 's' : ''}`}
          />
        )
      }
      
      weeks.push(
        <div key={week} className="flex flex-col gap-0.5 sm:space-y-1">
          {weekDays}
        </div>
      )
    }

    return (
      <div className="flex gap-0.5 sm:space-x-1">
        {weeks}
      </div>
    )
  }

  return (
    <div className="panel p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold font-mono" style={{ color: 'var(--dl-accent)' }}>
         {t('yearOverview')}
        </h2>
        <Button
          onClick={fetchStats}
          variant="ghost"
          size="sm"
          disabled={!user || loading}
          className="text-xs sm:text-sm"
        >
          {loading ? t('loading') : t('refresh')}
        </Button>
      </div>

      {/* Not Authenticated State */}
      {!user && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4 flex justify-center"><FaLock /></div>
          <p className="font-mono mb-2" style={{ color: 'var(--dl-muted)' }}>{t('signInMessage')}</p>
          <p className="font-mono text-sm" style={{ color: 'var(--dl-muted)' }}>{t('contributionInfo')}</p>
        </div>
      )}

      {/* Error State */}
      {user && error && (
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--dl-danger)', border: '1px solid var(--dl-danger)', opacity: 0.2 }}>
          <p className="font-mono text-sm flex items-center gap-1" style={{ color: 'var(--dl-danger)' }}><FaTimesCircle /> {error}</p>
        </div>
      )}

      {/* Loading State */}
      {user && loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--dl-accent)' }}></div>
          <p className="font-mono mt-2" style={{ color: 'var(--dl-muted)' }}>{t('loadingActivity')}</p>
        </div>
      )}

      {/* Stats Display */}
      {user && !loading && !error && stats && (
        <div className="space-y-4 sm:space-y-6">
          {/* Contribution Calendar */}
          <div>
            <div className="p-2 sm:p-4 rounded-lg" style={{ background: 'var(--dl-surface-2)' }}>
              <div
                ref={calendarRef}
                className="overflow-x-auto"
                style={{ 
                  maxWidth: '100%',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--dl-border) var(--dl-surface)'
                }}
              >
                {renderContributionCalendar()}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 text-[10px] sm:text-xs gap-2 sm:gap-3" style={{ color: 'var(--dl-muted)' }}>
                <div className='flex items-center space-x-1 sm:space-x-2'>
                <span>{t('less')}</span>
                <div className="flex space-x-0.5 sm:space-x-1">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm" style={{ background: 'var(--dl-surface)' }}></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm" style={{ background: 'var(--dl-accent-weak)' }}></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm" style={{ background: 'var(--dl-accent)' }}></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm" style={{ background: 'var(--dl-accent-2)' }}></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm" style={{ background: 'var(--dl-accent-2)' }}></div>
                </div>
                <span>{t('more')}</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm border-2" style={{ borderColor: 'var(--dl-accent-border)', background: 'transparent' }}></div>
                  <span>{t('devlog')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
