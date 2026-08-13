'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { DevLogEntry, Task, TimeEntry, MoodValue } from '@/types/devlog'
import type { DateContributionData } from '@/types/githubActivity'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations, useFormatter } from 'next-intl'
import { FaSadTear, FaMeh, FaSmile, FaGrin, FaBolt, FaBullseye, FaCheck, FaBug, FaBrain, FaChartLine, FaCode, FaPhone, FaLink, FaRocket, FaTrophy, FaClock, FaTools, FaLightbulb, FaFileAlt, FaExclamationTriangle, FaTimesCircle, FaGithub } from 'react-icons/fa'


export default function DevLogHistory() {
  const { isAuthenticated } = useAuth()
  const t = useTranslations('history')
  const tWorkweek = useTranslations('workweek')
  const tTemplate = useTranslations('template')
  const tCommon = useTranslations('common')
  const format = useFormatter()
  const [selectedLog, setSelectedLog] = useState<DevLogEntry | null>(null)
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all')
  const [query, setQuery] = useState<string>('')
  const [devLogs, setDevLogs] = useState<DevLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [githubActivityForDate, setGithubActivityForDate] = useState<DateContributionData | null>(null)
  const [loadingGithubActivity, setLoadingGithubActivity] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load dev logs when component mounts or filter changes
  const loadDevLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const limit = filter === 'week' ? 7 : filter === 'month' ? 30 : 50
      const response = await fetch(`/api/devlogs?limit=${limit}`)
      const data = await response.json()

      if (data.success) {
        setDevLogs(data.data.devLogs)
      } else {
        setError(data.error || t('errorLoading'))
      }
    } catch (error) {
      console.error('Error loading dev logs:', error)
      setError(t('errorNetwork'))
    } finally {
      setLoading(false)
    }
  }, [filter, t])

  useEffect(() => {
    if (isAuthenticated) {
      loadDevLogs()
    }
  }, [isAuthenticated, loadDevLogs])

  const getFilteredLogs = () => {
    if (!devLogs.length) return []
    
    const now = new Date()
    const byDate = devLogs.filter(log => {
      const logDate = new Date(log.date)
      switch (filter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return logDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return logDate >= monthAgo
        default:
          return true
      }
    })

    if (!query.trim()) return byDate

    const q = query.toLowerCase()
    const matchLog = (log: DevLogEntry) => {
      const logAny = log as any
      if (log.title && log.title.toLowerCase().includes(q)) return true
      if (typeof logAny.reflection === 'string' && logAny.reflection.toLowerCase().includes(q)) return true
      if (Array.isArray(logAny.learnings) && logAny.learnings.some((l: string) => l.toLowerCase().includes(q))) return true
      if (Array.isArray(logAny.tasks) && logAny.tasks.some((t: Task) => t.description?.toLowerCase().includes(q))) return true
      return Object.values(log.modules || {}).some((value) => {
        if (value == null) return false
        if (typeof value === 'string') return value.toLowerCase().includes(q)
        if (typeof value === 'number') return String(value).includes(q)
        if (Array.isArray(value)) return value.join(' ').toLowerCase().includes(q)
        try {
          return JSON.stringify(value).toLowerCase().includes(q)
        } catch {
          return false
        }
      })
    }

    return byDate.filter(matchLog)
  }

  const formatDate = (dateString: string) => {
    return format.dateTime(new Date(dateString), { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const fetchGithubActivityForDate = async (date: string) => {
    setLoadingGithubActivity(true)
    try {
      const response = await fetch(`/api/github/contributions/date?date=${date}`)
      const result = await response.json()

      if (result.success) {
        setGithubActivityForDate(result.data)
      }
    } catch (err) {
      console.error('Error fetching GitHub activity for date:', err)
    } finally {
      setLoadingGithubActivity(false)
    }
  }

  const handleLogClick = (log: DevLogEntry) => {
    setSelectedLog(log)
    setGithubActivityForDate(null)
    // Fetch GitHub activity for this date
    const logDate = new Date(log.date).toISOString().split('T')[0]
    fetchGithubActivityForDate(logDate)
  }

  return (
    <div className="panel p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-mono" style={{ color: 'var(--dl-accent)' }}>{t('title')}</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'week' | 'month')}
            className="px-3 py-2 rounded-lg text-sm font-mono"
            style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
          >
            <option value="all">{t('filterAll')}</option>
            <option value="week">{t('filterWeek')}</option>
            <option value="month">{t('filterMonth')}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
            style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
          />
          <button
            onClick={() => setQuery(query.trim())}
            className="px-3 py-2 rounded-lg text-sm font-mono"
            style={{ background: 'var(--dl-accent)', color: 'white' }}
          >
            {tCommon('search')}
          </button>
        </div>
        <div className="mt-2 text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>
          {t('resultsFound', { count: getFilteredLogs().length })}
        </div>
      </div>

      {/* Auth Check */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--dl-warning)', border: '1px solid var(--dl-warning)', opacity: 0.2 }}>
          <p className="font-mono text-sm" style={{ color: 'var(--dl-warning)' }}>
            <FaExclamationTriangle className="inline mr-1" /> {t('signInMessage')}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--dl-accent)' }}></div>
          <p className="font-mono mt-2" style={{ color: 'var(--dl-muted)' }}>{t('loading')}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--dl-danger)', border: '1px solid var(--dl-danger)', opacity: 0.2 }}>
          <p className="font-mono text-sm flex items-center gap-1" style={{ color: 'var(--dl-danger)' }}><FaTimesCircle /> {error}</p>
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {isAuthenticated && !loading && !error && getFilteredLogs().map((log) => {
          const mood = extractMood(log)
          const reflection = extractReflection(log)
          const learnings = extractLearnings(log)
          const tasks = extractTasks(log)
          const completedTasks = tasks.filter((task) => task.completed)

          return (
            <div
              key={log.id ?? log.date}
              onClick={() => handleLogClick(log)}
              className="p-4 rounded-lg border cursor-pointer transition-all font-mono mx-1"
              style={{ 
                background: 'var(--dl-surface-2)', 
                borderColor: 'var(--dl-border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--dl-accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--dl-border)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--dl-text)' }}>{formatDate(log.date)}</span>
                {mood && (
                  <div className="flex items-center space-x-2">
                    <MoodIcon mood={mood} />
                  </div>
                )}
              </div>

              <div className="space-y-1 text-xs">
                {completedTasks.length > 0 && (
                  <div className="truncate" style={{ color: 'var(--dl-accent)' }}>
                    <FaCheck className="inline mr-1" /> {t('goalsCompleted', { count: completedTasks.length, plural: completedTasks.length !== 1 ? 'e' : '' })}
                  </div>
                )}
                {reflection && (
                  <div className="truncate" style={{ color: 'var(--dl-muted)' }}>
                    📝 {reflection.substring(0, 80)}{reflection.length > 80 ? '…' : ''}
                  </div>
                )}
                {learnings.length > 0 && (
                  <div className="truncate" style={{ color: 'var(--dl-accent-2)' }}>
                    🧠 {learnings[0]}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Empty State */}
        {isAuthenticated && !loading && !error && getFilteredLogs().length === 0 && (
          <div className="text-center py-8">
            <p className="font-mono" style={{ color: 'var(--dl-muted)' }}>{t('noLogsFound')}</p>
            <p className="font-mono text-xs mt-1" style={{ color: 'var(--dl-muted)' }}>
              {t('createFirst')}
            </p>
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      {mounted && selectedLog && createPortal((() => {
        const mood = extractMood(selectedLog)
        const reflection = extractReflection(selectedLog)
        const learnings = extractLearnings(selectedLog)
        const tasks = extractTasks(selectedLog)
        const timeEntries = extractTimeEntries(selectedLog)

        return (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="rounded-xl border p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto font-mono" style={{ background: 'var(--dl-surface)', borderColor: 'var(--dl-border)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold" style={{ color: 'var(--dl-accent)' }}>
                  {selectedLog.title}
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--dl-text)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {mood && (
                  <div>
                    <div className="text-sm" style={{ color: 'var(--dl-text)' }}>{t('mood')}</div>
                    <div className="text-xl"><MoodIcon mood={mood} /></div>
                  </div>
                )}

                {reflection && (
                  <div>
                    <div className="text-sm" style={{ color: 'var(--dl-muted)' }}>{t('reflection')}</div>
                    <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--dl-text)' }}>{reflection}</div>
                  </div>
                )}

                {learnings.length > 0 && (
                  <div>
                    <div className="text-sm" style={{ color: 'var(--dl-muted)' }}>{t('learnings')}</div>
                    <ul className="text-sm list-disc list-inside" style={{ color: 'var(--dl-text)' }}>
                      {learnings.map((learning, index) => (
                        <li key={index}>{learning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {tasks.length > 0 && (
                  <div>
                    <div className="text-sm mb-2" style={{ color: 'var(--dl-text)' }}>{t('goals')}</div>
                    <ul className="text-sm list-inside space-y-1 list-style-none">
                      {tasks.sort((a, b) => Number(a.completed) - Number(b.completed)).map((task) => (
                        <li key={task.id} style={{ color: task.completed ? 'var(--dl-accent)' : 'var(--dl-text)' }}>
                          {task.completed ? '✓' : '•'} {task.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {timeEntries.length > 0 && (
                  <div>
                    <div className="text-sm" style={{ color: 'var(--dl-muted)' }}>{tWorkweek('timeTracking')}</div>
                    <ul className="text-sm list-disc list-inside" style={{ color: 'var(--dl-text)' }}>
                      {timeEntries.map((entry) => (
                        <li key={entry.id}>{entry.description} – {entry.duration}h</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* GitHub Activity for this date */}
              {loadingGithubActivity && (
                <div className="mb-6 p-4 rounded-lg border" style={{ background: 'var(--dl-surface-2)', borderColor: 'var(--dl-border)' }}>
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--dl-accent)' }}></div>
                    <span className="font-mono text-sm" style={{ color: 'var(--dl-muted)' }}>{tWorkweek('loadingActivity')}</span>
                  </div>
                </div>
              )}

              {githubActivityForDate && !loadingGithubActivity && (
                <div className="mb-6 p-4 rounded-lg border z-10" style={{  background: 'var(--dl-surface-2)',borderColor: 'var(--dl-accent-2)', opacity: 0.8 }}>
                  <h4 className="flex items-center font-mono text-sm mb-2" style={{ color: 'var(--dl-text)' }}>
                    <FaGithub className="inline mr-1" />
                    GitHub Activity on {format.dateTime(new Date(githubActivityForDate.date), { day: 'numeric', month: 'short', year: 'numeric' })}
                  </h4>
                  <div className="flex items-center space-x-2 my-4">
                    <span className="text-2xl font-bold" style={{ color: 'var(--dl-text)' }}>
                      {githubActivityForDate.contributionCount}
                    </span>
                    <span className="font-mono text-sm" style={{ color: 'var(--dl-muted)' }}>
                      contribution{githubActivityForDate.contributionCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {githubActivityForDate.breakdown && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                      {githubActivityForDate.breakdown.commits > 0 && (
                        <div style={{ color: 'var(--dl-text)' }}>
                          📝 {githubActivityForDate.breakdown.commits} commit{githubActivityForDate.breakdown.commits !== 1 ? 's' : ''}
                        </div>
                      )}
                      {githubActivityForDate.breakdown.pullRequests > 0 && (
                        <div style={{ color: 'var(--dl-text)' }}>
                          🔀 {githubActivityForDate.breakdown.pullRequests} PR{githubActivityForDate.breakdown.pullRequests !== 1 ? 's' : ''}
                        </div>
                      )}
                      {githubActivityForDate.breakdown.issues > 0 && (
                        <div style={{ color: 'var(--dl-text)' }}>
                          🐛 {githubActivityForDate.breakdown.issues} issue{githubActivityForDate.breakdown.issues !== 1 ? 's' : ''}
                        </div>
                      )}
                      {githubActivityForDate.breakdown.reviews > 0 && (
                        <div style={{ color: 'var(--dl-text)' }}>
                          👀 {githubActivityForDate.breakdown.reviews} review{githubActivityForDate.breakdown.reviews !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-6">
                {Object.entries(selectedLog.modules || {})
                  .filter(([key]) => !['tasks', 'learnings', 'reflection', 'mood', 'time_entries', 'time_tracking'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <h4 className="text-lg flex items-center gap-2" style={{ color: 'var(--dl-text)' }}>
                        {(() => {
                          const Icon = getModuleIcon(key)
                          return <><Icon /> {getModuleTitle(key, tTemplate)}</>
                        })()}
                      </h4>
                      <div className="whitespace-pre-wrap" style={{ color: 'var(--dl-muted)' }}>
                        {typeof value === 'object' && value !== null ? 
                          JSON.stringify(value, null, 2) : 
                          String(value)
                        }
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )
      })(), document.body)}
    </div>
  )
}

function MoodIcon({ mood }: { mood: number | null }) {
  if (!mood) return null
  const icons = [FaSadTear, FaMeh, FaSmile, FaGrin, FaBolt]
  const Icon = icons[mood - 1]
  return Icon ? <Icon className="text-lg" /> : null
}

function extractMood(log: DevLogEntry): number | null {
  const logAny = log as any
  if (typeof logAny.mood === 'number') return logAny.mood
  if (log.modules?.mood) {
    const mood = log.modules.mood as MoodValue
    if (typeof mood?.mood === 'number') return mood.mood
  }
  return null
}

function extractReflection(log: DevLogEntry): string {
  const logAny = log as any
  if (typeof logAny.reflection === 'string' && logAny.reflection.trim().length > 0) return logAny.reflection
  const modulesReflection = log.modules?.reflection
  if (typeof modulesReflection === 'string') return modulesReflection
  return ''
}

function extractLearnings(log: DevLogEntry): string[] {
  const logAny = log as any
  if (Array.isArray(logAny.learnings) && logAny.learnings.length > 0) return logAny.learnings
  const modulesLearnings = log.modules?.learnings
  if (Array.isArray(modulesLearnings)) return modulesLearnings as string[]
  return []
}

function extractTasks(log: DevLogEntry): Task[] {
  const logAny = log as any
  if (Array.isArray(logAny.tasks)) return logAny.tasks
  if (log.modules?.tasks && Array.isArray(log.modules.tasks)) {
    return log.modules.tasks as unknown as Task[]
  }
  return []
}

function extractTimeEntries(log: DevLogEntry): TimeEntry[] {
  const logAny = log as any
  if (Array.isArray(logAny.time_entries)) return logAny.time_entries
  if (log.modules?.time_tracking && Array.isArray(log.modules.time_tracking)) {
    return log.modules.time_tracking as unknown as TimeEntry[]
  }
  return []
}

function getModuleIcon(key: string) {
  const icons: { [key: string]: typeof FaBullseye } = {
    goals: FaBullseye,
    achieved: FaCheck,
    problems: FaBug,
    learnings: FaBrain,
    mood: FaChartLine,
    code_snippets: FaCode,
    meetings: FaPhone,
    resources: FaLink,
    next_steps: FaRocket,
    challenges: FaBolt,
    accomplishments: FaTrophy,
    time_tracking: FaClock,
    tools_used: FaTools,
    reflection: FaLightbulb
  }
  return icons[key] || FaFileAlt
}

function getModuleTitle(key: string, t: any): string {
  const keyMap: { [key: string]: string } = {
    goals: 'goalsToday',
    achieved: 'achieved',
    problems: 'problems',
    learnings: 'insights',
    mood: 'moodEnergy',
    code_snippets: 'codeSnippets',
    meetings: 'meetings',
    resources: 'resources',
    next_steps: 'nextSteps',
    challenges: 'challenges',
    accomplishments: 'accomplishments',
    time_tracking: 'timeTracking',
    tools_used: 'toolsUsed',
    reflection: 'reflection'
  }
  const translationKey = keyMap[key]
  return translationKey ? t(translationKey) : key
}
