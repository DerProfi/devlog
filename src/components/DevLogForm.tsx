'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Task, TimeEntry } from '@/types/devlog'
import { GoalTag } from '@/components/goals'
import { useAuth } from '@/contexts/AuthContext'
import { useDeepWork } from '@/contexts/DeepWorkContext'
import { useTranslations, useFormatter } from 'next-intl'
import { FaSadTear, FaMeh, FaSmile, FaGrin, FaBolt, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa'

export default function DevLogForm() {
  const { isAuthenticated } = useAuth()
  const { setTasks: setDeepWorkTasks, registerTimeEntryCallback, unregisterTimeEntryCallback } = useDeepWork()
  const t = useTranslations('devlog')
  const tCommon = useTranslations('common')
  const format = useFormatter()

  const [reflection, setReflection] = useState<string>('')
  const [mood, setMood] = useState<number | null>(null)
  const [learnings, setLearnings] = useState<string[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load today's dev log on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadTodaysLog()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (focusTaskId) {
      const input = inputRefs.current[focusTaskId]
      if (input) {
        input.focus()
        input.select()
      }
      setFocusTaskId(null)
    }
  }, [focusTaskId, tasks])

  useEffect(() => {
    if (!isLoading && tasks.length === 0) {
      const id = newId()
      setTasks([{ id, description: '', completed: false }])
      setFocusTaskId(id)
    }
  }, [isLoading, tasks.length])

  // Sync tasks with DeepWork context for task selection in timer
  useEffect(() => {
    setDeepWorkTasks(tasks)
  }, [tasks, setDeepWorkTasks])

  // Register callback for time entries created by Deep Work timer
  useEffect(() => {
    const handleTimeEntry = (entry: TimeEntry) => {
      setTimeEntries(prev => [...prev, entry])
    }
    registerTimeEntryCallback(handleTimeEntry)
    return () => {
      unregisterTimeEntryCallback()
    }
  }, [registerTimeEntryCallback, unregisterTimeEntryCallback])

  const autoSave = useCallback(async () => {
    if (!isAuthenticated) return

    setIsAutoSaving(true)

    try {
      const response = await fetch('/api/devlogs/today', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reflection,
          mood,
          learnings,
          tasks,
          timeEntries
        })
      })

      const data = await response.json()

      if (!data.success) {
        console.error('Auto-save failed:', data.error)
      }
    } catch (error) {
      console.error('Auto-save error:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [isAuthenticated, reflection, mood, learnings, tasks, timeEntries])

  // Auto-save effect - triggers when tasks, learnings, reflection, mood, or timeEntries change
  useEffect(() => {
    if (isLoading || !isAuthenticated) return

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new timeout for auto-save (debounce)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave()
    }, 1000) // Wait 1 second after last change

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [tasks, learnings, reflection, mood, timeEntries, isAuthenticated, isLoading, autoSave])

  const loadTodaysLog = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/devlogs/today')
      const data = await response.json()

      if (data.success && data.data) {
        const log = data.data
        setReflection(log.reflection || '')
        setMood(log.mood ?? null)
        setLearnings(Array.isArray(log.learnings) ? log.learnings : [])
        setTasks(Array.isArray(log.tasks) ? log.tasks : [])
        setTimeEntries(Array.isArray(log.time_entries) ? log.time_entries : [])
        setMessage(null)
      } else {
        setReflection('')
        setMood(null)
        setLearnings([])
        setTasks([])
        setTimeEntries([])
      }
    } catch (error) {
      console.error('Error loading today\'s log:', error)
      setMessage({ type: 'error', text: t('errorLoad') })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLearning = () => setLearnings((prev) => [...prev, ''])
  const handleLearningChange = (index: number, value: string) => {
    setLearnings((prev) => prev.map((l, i) => (i === index ? value : l)))
  }
  const handleRemoveLearning = (index: number) => {
    setLearnings((prev) => prev.filter((_, i) => i !== index))
  }

  const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

  const handleAddTask = (initialDescription = '') => {
    const id = newId()
    setTasks((prev) => [...prev, { id, description: initialDescription, completed: false }])
    setFocusTaskId(id)
  }
  const handleTaskChange = (id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }
  const handleRemoveTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    delete inputRefs.current[id]
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault()

    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null)
      return
    }

    setTasks((prev) => {
      const newTasks = [...prev]
      const draggedIndex = newTasks.findIndex(t => t.id === draggedTaskId)
      const targetIndex = newTasks.findIndex(t => t.id === targetTaskId)

      if (draggedIndex === -1 || targetIndex === -1) return prev

      const [draggedTask] = newTasks.splice(draggedIndex, 1)
      newTasks.splice(targetIndex, 0, draggedTask)

      return newTasks
    })

    setDraggedTaskId(null)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
  }

  const handleAddTimeEntry = () => setTimeEntries((prev) => [...prev, { id: newId(), description: '', duration: 0 }])
  const handleTimeEntryChange = (id: string, patch: Partial<TimeEntry>) => {
    setTimeEntries((prev) => prev.map((te) => (te.id === id ? { ...te, ...patch } : te)))
  }
  const handleRemoveTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((te) => te.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      setMessage({ type: 'error', text: t('loginRequired') })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/devlogs/today', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reflection,
          mood,
          learnings,
          tasks,
          timeEntries
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: t('success') })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || t('errorSave') })
      }
    } catch (error) {
      console.error('Error saving dev log:', error)
      setMessage({ type: 'error', text: t('errorNetwork') })
    } finally {
      setIsSaving(false)
    }
  }

  const fullDate = format.dateTime(new Date(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h2 className="text-2xl font-semibold font-mono" style={{ color: 'var(--dl-accent)' }}>{t('title')}</h2>
        <div className="flex items-center gap-3">
          {isAutoSaving && (
            <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2" style={{ borderColor: 'var(--dl-accent)' }}></div>
              {t('saving')}
            </div>
          )}
          <div className="text-sm font-mono" style={{ color: 'var(--dl-muted)' }}>{fullDate}</div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--dl-accent)' }}></div>
          <p className="font-mono mt-2" style={{ color: 'var(--dl-muted)' }}>{t('loadingLog')}</p>
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 rounded-lg" style={{ 
          background: message.type === 'success' ? 'var(--dl-accent-weak)' : 'var(--dl-danger)', 
          border: `1px solid ${message.type === 'success' ? 'var(--dl-accent)' : 'var(--dl-danger)'}`,
          opacity: 0.2
        }}>
          <p className="font-mono text-sm" style={{ color: message.type === 'success' ? 'var(--dl-accent)' : 'var(--dl-danger)' }}>
            {message.type === 'success' ? <FaCheckCircle className="inline mr-1" /> : <FaTimesCircle className="inline mr-1" />} {message.text}
          </p>
        </div>
      )}

      {!isAuthenticated && (
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--dl-warning)', border: '1px solid var(--dl-warning)', opacity: 0.2 }}>
          <p className="font-mono text-sm flex items-center gap-1" style={{ color: 'var(--dl-warning)' }}><FaExclamationTriangle /> {t('loginRequiredNotice')}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ziele von heute */}
        <div>
          <label className="block font-mono mb-2" style={{ color: 'var(--dl-text)' }}>{t('goals')}</label>
          <div className="space-y-2 h-[240px] overflow-y-auto scroll-smooth">
            {tasks.sort((a, b) => Number(a.completed) - Number(b.completed)).map((task) => (
              <div
                key={task.id}
                draggable={!task.completed}
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, task.id)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-2 p-3 rounded-lg transition-opacity"
                style={{
                  background: 'var(--dl-surface)',
                  border: '1px solid var(--dl-border)',
                  opacity: draggedTaskId === task.id ? 0.5 : 1,
                  cursor: task.completed ? 'default' : 'grab'
                }}
              >
                {!task.completed && (
                  <span className="text-xs" style={{ color: 'var(--dl-muted)', cursor: 'grab' }}>⋮⋮</span>
                )}
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => handleTaskChange(task.id, { completed: e.target.checked })}
                  className="w-4 h-4 flex-shrink-0"
                />
                <input
                  type="text"
                  className="flex-1 min-w-0 bg-transparent border-none outline-none font-mono"
                  style={{
                    color: 'var(--dl-text)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    opacity: task.completed ? 0.6 : 1
                  }}
                  value={task.description}
                  onChange={(e) => handleTaskChange(task.id, { description: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (task.description.trim().length === 0) {
                        e.preventDefault()
                        return
                      }
                      e.preventDefault()
                      handleAddTask()
                    }
                  }}
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[task.id] = el
                    } else {
                      delete inputRefs.current[task.id]
                    }
                  }}
                  placeholder={t('goalPlaceholder')}
                />
                <GoalTag
                  goalId={task.goal_id}
                  onGoalSelect={(goalId) => handleTaskChange(task.id, { goal_id: goalId })}
                  disabled={task.completed}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTask(task.id)}
                  className="flex-shrink-0 px-2 py-1 text-xs rounded font-mono"
                  style={{ background: 'var(--dl-surface-2)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddTask()}
              className="w-full px-3 py-2 text-sm rounded-lg font-mono"
              style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
            >
              {t('addGoal')}
            </button>
          </div>
          <div className="mt-2 px-3 py-2 text-xs font-mono rounded-lg" style={{ color: 'var(--dl-muted)', border: '1px solid var(--dl-border)', background: 'var(--dl-surface)' }}>
            {tasks.filter(t => t.completed).length} {t('of')} {tasks.length || 0} {t('completed')}
          </div>
        </div>

        {/* Reflexion & Learnings */}
        <div>
          <label className="block font-mono mb-2" style={{ color: 'var(--dl-text)' }}>{t('reflection')}</label>
          <textarea
            className="w-full p-3 rounded-lg font-mono resize-none"
            style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
            rows={5}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder={t('reflectionPlaceholder')}
          />
        </div>

        {/* Stimmung */}
        <div>
          <label className="block font-mono mb-3" style={{ color: 'var(--dl-text)' }}>{t('mood')}</label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { val: 1, label: t('moodLabels.exhausted'), Icon: FaSadTear },
              { val: 2, label: t('moodLabels.bad'), Icon: FaMeh },
              { val: 3, label: t('moodLabels.neutral'), Icon: FaSmile },
              { val: 4, label: t('moodLabels.good'), Icon: FaGrin },
              { val: 5, label: t('moodLabels.super'), Icon: FaBolt }
            ].map(({ val, label, Icon }) => (
              <button
                key={val}
                type="button"
                onClick={() => setMood(val)}
                className="p-3 rounded-lg border font-mono text-sm flex flex-col items-center gap-1"
                style={{
                  borderColor: mood === val ? (val === 1 ? 'var(--dl-danger)' : 'var(--dl-accent)') : 'var(--dl-border)',
                  background: mood === val ? (val === 1 ? 'var(--dl-danger)' : 'var(--dl-accent-weak)') : 'var(--dl-surface)',
                  color: mood === val ? 'white' : 'var(--dl-text)',
                  opacity: mood === val && val === 1 ? 0.2 : 1
                }}
              >
                <Icon className="text-xl" />
                <span className="hidden sm:block">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Optionale Module */}
        <div className="space-y-3">
          <div className="font-mono text-sm" style={{ color: 'var(--dl-text)' }}>{t('modules.title')}</div>
          <details className="group rounded-lg" style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)' }}>
            <summary className="cursor-pointer px-4 py-3 font-mono text-sm" style={{ color: 'var(--dl-text)' }}>{t('modules.codeSnippet')}</summary>
            <div className="p-4 pt-0 space-y-3">
              {/* Markdown Info Box */}
              <div
                className="rounded-lg p-3 text-xs font-mono"
                style={{ background: 'var(--dl-surface-2)', border: '1px solid var(--dl-border)', color: 'var(--dl-text-secondary)' }}
              >
                <div className="font-semibold mb-2" style={{ color: 'var(--dl-text)' }}>
                  {t('snippetMarkdownInfo.title')}
                </div>
                <div className="space-y-1">
                  <div><code className="px-1 rounded" style={{ background: 'var(--dl-surface)' }}>```js</code> {t('snippetMarkdownInfo.codeBlock')}</div>
                  <div><code className="px-1 rounded" style={{ background: 'var(--dl-surface)' }}>`code`</code> {t('snippetMarkdownInfo.inlineCode')}</div>
                  <div><code className="px-1 rounded" style={{ background: 'var(--dl-surface)' }}>**bold**</code> {t('snippetMarkdownInfo.bold')}</div>
                  <div><code className="px-1 rounded" style={{ background: 'var(--dl-surface)' }}>- item</code> {t('snippetMarkdownInfo.list')}</div>
                </div>
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--dl-border)' }}>
                  <div className="mb-1">{t('snippetMarkdownInfo.example')}</div>
                  <pre className="p-2 rounded text-xs overflow-x-auto" style={{ background: 'var(--dl-surface)' }}>{`\`\`\`typescript
const greeting = "Hello World";
console.log(greeting);
\`\`\``}</pre>
                </div>
              </div>
              <textarea
                className="w-full p-3 rounded-lg font-mono resize-none"
                style={{ background: 'var(--dl-surface-2)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
                rows={4}
                placeholder={t('snippetPlaceholder')}
              />
            </div>
          </details>
          <details className="group rounded-lg" style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)' }}>
            <summary className="cursor-pointer px-4 py-3 font-mono text-sm" style={{ color: 'var(--dl-text)' }}>{t('modules.learning')}</summary>
            <div className="p-4 pt-0 space-y-2">
              {learnings.map((l, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={l}
                    onChange={(e) => handleLearningChange(idx, e.target.value)}
                    className="flex-1 p-2 rounded font-mono"
                    style={{ background: 'var(--dl-surface-2)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
                    placeholder={t('learningLabel', { number: idx + 1 })}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLearning(idx)}
                    className="px-2 py-1 text-xs rounded font-mono"
                    style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
                  >
                    {tCommon('remove')}
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddLearning}
                className="px-3 py-1 rounded font-mono text-sm"
                style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
              >
                {tCommon('add')}
              </button>
            </div>
          </details>
          <details className="group rounded-lg" style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)' }}>
            <summary className="cursor-pointer px-4 py-3 font-mono text-sm" style={{ color: 'var(--dl-text)' }}>{t('modules.timeTracking')}</summary>
            <div className="p-4 pt-0 space-y-2">
              {timeEntries.map((te) => (
                <div key={te.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={te.description}
                    onChange={(e) => handleTimeEntryChange(te.id, { description: e.target.value })}
                    className="col-span-9 p-2 rounded font-mono"
                    style={{ background: 'var(--dl-surface-2)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
                    placeholder={t('description')}
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.25}
                    value={te.duration}
                    onChange={(e) => handleTimeEntryChange(te.id, { duration: Number(e.target.value) })}
                    className="col-span-2 p-2 rounded font-mono"
                    style={{ background: 'var(--dl-surface-2)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
                    placeholder={t('hours')}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTimeEntry(te.id)}
                    className="col-span-1 px-2 py-1 text-xs rounded font-mono"
                    style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddTimeEntry}
                className="px-3 py-1 rounded font-mono text-sm"
                style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
              >
                {tCommon('add')}
              </button>
            </div>
          </details>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isAuthenticated || isSaving}
            className="px-6 py-3 rounded-lg font-medium font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--dl-accent)', color: 'white' }}
          >
            {isSaving ? t('saving') : tCommon('save')}
          </button>
        </div>
      </form>
    </div>
  )
}

