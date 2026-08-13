'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { DevLogEntry, Task, TimeEntry, MoodValue } from '@/types/devlog'
import type { DateContributionData } from '@/types/githubActivity'
import { useTranslations, useFormatter } from 'next-intl'
import { FaSadTear, FaMeh, FaSmile, FaGrin, FaBolt, FaBullseye, FaCheck, FaBug, FaBrain, FaChartLine, FaCode, FaPhone, FaLink, FaRocket, FaTrophy, FaClock, FaTools, FaLightbulb, FaFileAlt, FaGithub } from 'react-icons/fa'

export default function WorkWeekBoard() {
  const t = useTranslations('workweek')
  const tTemplate = useTranslations('template')
  const format = useFormatter()
  const [logs, setLogs] = useState<DevLogEntry[]>([])
  const [selectedLog, setSelectedLog] = useState<DevLogEntry | null>(null)
  const [githubActivityForDate, setGithubActivityForDate] = useState<DateContributionData | null>(null)
  const [loadingGithubActivity, setLoadingGithubActivity] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/devlogs?limit=10')
      const json = await res.json()
      if (json?.success) setLogs(json.data.devLogs)
    }
    run()
  }, [])

  const days = useMemo(() => buildWeek(logs, format), [logs, format])

  const weekStart = new Date()
  const dow = weekStart.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  weekStart.setDate(weekStart.getDate() + mondayOffset)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const weekRange = `${format.dateTime(weekStart, { day: '2-digit', month: 'short' })} - ${format.dateTime(weekEnd, { day: '2-digit', month: 'short', year: 'numeric' })}`

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

  const handleDayClick = (date: string) => {
    const log = logs.find((entry) => {
      const logDate = new Date(entry.date).toISOString().split('T')[0]
      return logDate === date
    })
    if (log) {
      setSelectedLog(log)
      setGithubActivityForDate(null)
      fetchGithubActivityForDate(date)
    }
  }

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono" style={{ color: 'var(--dl-text)' }}>{t('title')}</div>
          <div className="text-xs font-mono mt-1" style={{ color: 'var(--dl-muted)' }}>{weekRange}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {days.map((d) => {
          const todayISO = new Date().toISOString().split('T')[0]
          const isToday = d.date === todayISO

          return (
            <div
              key={d.date}
              onClick={() => handleDayClick(d.date)}
              className="rounded-lg border p-3 min-h-[140px] cursor-pointer transition-all"
              style={{
                borderColor: isToday ? 'var(--dl-accent)' : 'var(--dl-border)',
                background: 'var(--dl-surface-2)',
                borderWidth: isToday ? '2px' : '1px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--dl-accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isToday ? 'var(--dl-accent)' : 'var(--dl-border)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>{d.label}</div>
              </div>
              <div className="space-y-2">
                {d.completedTasks.length > 0 ? (
                  <div>
                    <div className="text-[10px] font-mono mb-1" style={{ color: 'var(--dl-muted)' }}>{t('completed')}</div>
                    <ul className="space-y-1 text-[11px] font-mono" style={{ color: 'var(--dl-accent)' }}>
                      {d.completedTasks.slice(0, 4).map((t, i) => (
                        <li key={i} className="truncate">✓ {t.description || '—'}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>{t('noEntries')}</div>
                )}
              </div>
            </div>
          )
        })}
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
                    <div className="text-sm" style={{ color: 'var(--dl-muted)' }}>{t('timeTracking')}</div>
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
                    <span className="font-mono text-sm" style={{ color: 'var(--dl-muted)' }}>{t('loadingActivity')}</span>
                  </div>
                </div>
              )}

              {githubActivityForDate && !loadingGithubActivity && (
                <div className="mb-6 p-4 rounded-lg border z-10" style={{ background: 'var(--dl-surface-2)', borderColor: 'var(--dl-accent-2)', opacity: 0.8 }}>
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

function buildWeek(logs: DevLogEntry[], formatter: ReturnType<typeof useFormatter>) {
  const today = new Date()
  const monday = new Date(today)
  const dow = monday.getDay()
  const offset = dow === 0 ? -6 : 1 - dow
  monday.setDate(monday.getDate() + offset)

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const iso = date.toISOString().split('T')[0]
    const log = logs.find((entry) => {
      const logDate = new Date(entry.date).toISOString().split('T')[0]
      return logDate === iso
    })

    let tasks: Task[] = []
    if (log) {
      const logAny = log as any
      if (Array.isArray(logAny.tasks)) {
        tasks = logAny.tasks
      } else if (log.modules?.tasks) {
        const moduleTasks = log.modules.tasks
        if (Array.isArray(moduleTasks) && (moduleTasks.length === 0 || typeof moduleTasks[0] === 'object')) {
          tasks = moduleTasks as unknown as Task[]
        }
      }
    }

    return {
      date: iso,
      label: formatter.dateTime(date, { weekday: 'short', day: '2-digit', month: 'short' }),
      completedTasks: tasks.filter((task) => task.completed),
      weekday: date.getDay()
    }
  })
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


