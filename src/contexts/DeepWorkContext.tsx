'use client'

import { createContext, useContext, ReactNode, useState, useCallback, useRef } from 'react'
import { Task, TimeEntry } from '@/types/devlog'
import { PomodoroState, DeepWorkSettings } from '@/types/deepWork'
import { usePomodoro } from '@/hooks/usePomodoro'

interface DeepWorkContextType {
  // Timer state
  state: PomodoroState
  settings: DeepWorkSettings
  formattedTime: string
  progress: number
  isRunning: boolean
  isPaused: boolean
  isIdle: boolean
  isWorkPhase: boolean
  isBreakPhase: boolean
  // Timer controls
  start: (taskId?: string, taskDescription?: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
  skip: () => void
  reset: () => void
  setTask: (taskId?: string, taskDescription?: string) => void
  updateSettings: (settings: Partial<DeepWorkSettings>) => void
  // Tasks management
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  // Time entry callback
  registerTimeEntryCallback: (callback: (entry: TimeEntry) => void) => void
  unregisterTimeEntryCallback: () => void
}

const DeepWorkContext = createContext<DeepWorkContextType | null>(null)

interface DeepWorkProviderProps {
  children: ReactNode
}

export function DeepWorkProvider({ children }: DeepWorkProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const timeEntryCallbackRef = useRef<((entry: TimeEntry) => void) | null>(null)

  const handleWorkComplete = useCallback((totalMinutes: number, taskDescription?: string) => {
    if (timeEntryCallbackRef.current) {
      const entry: TimeEntry = {
        id: crypto.randomUUID(),
        description: taskDescription || 'Deep Work Session',
        duration: totalMinutes
      }
      timeEntryCallbackRef.current(entry)
    }
  }, [])

  const pomodoro = usePomodoro({
    onWorkComplete: handleWorkComplete
  })

  const registerTimeEntryCallback = useCallback((callback: (entry: TimeEntry) => void) => {
    timeEntryCallbackRef.current = callback
  }, [])

  const unregisterTimeEntryCallback = useCallback(() => {
    timeEntryCallbackRef.current = null
  }, [])

  const value: DeepWorkContextType = {
    ...pomodoro,
    tasks,
    setTasks,
    registerTimeEntryCallback,
    unregisterTimeEntryCallback
  }

  return (
    <DeepWorkContext.Provider value={value}>
      {children}
    </DeepWorkContext.Provider>
  )
}

export function useDeepWork() {
  const context = useContext(DeepWorkContext)
  if (!context) {
    throw new Error('useDeepWork must be used within a DeepWorkProvider')
  }
  return context
}
