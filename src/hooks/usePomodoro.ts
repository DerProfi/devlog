'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  PomodoroState,
  PomodoroPhase,
  DeepWorkSettings,
  DEFAULT_DEEP_WORK_SETTINGS,
  PersistedPomodoroState
} from '@/types/deepWork'

const STORAGE_KEY = 'deepwork-session'
const SETTINGS_KEY = 'deepwork-settings'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

interface UsePomodoroOptions {
  onPhaseComplete?: (phase: PomodoroPhase, cyclesCompleted: number) => void
  onWorkComplete?: (totalMinutes: number, taskDescription?: string) => void
}

export function usePomodoro(options: UsePomodoroOptions = {}) {
  const { onPhaseComplete, onWorkComplete } = options

  const [settings, setSettings] = useState<DeepWorkSettings>(DEFAULT_DEEP_WORK_SETTINGS)
  const [state, setState] = useState<PomodoroState>({
    status: 'idle',
    phase: 'work',
    timeRemaining: DEFAULT_DEEP_WORK_SETTINGS.workDuration * 60,
    cyclesCompleted: 0,
    totalWorkMinutes: 0
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationPermissionRef = useRef<NotificationPermission>('default')

  // Load settings and persisted state on mount
  useEffect(() => {
    // Load settings
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as DeepWorkSettings
        setSettings(parsed)
      } catch {
        // Use defaults
      }
    }

    // Load persisted session
    const savedSession = localStorage.getItem(STORAGE_KEY)
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession) as PersistedPomodoroState
        const elapsed = Math.floor((Date.now() - parsed.savedAt) / 1000)

        // Only restore if session is recent (within 2 hours) and was running
        if (elapsed < 7200 && parsed.state.status === 'running') {
          const newTimeRemaining = Math.max(0, parsed.state.timeRemaining - elapsed)

          if (newTimeRemaining > 0) {
            setState({
              ...parsed.state,
              timeRemaining: newTimeRemaining,
              status: 'paused' // Resume as paused, let user continue
            })
          } else {
            // Timer would have completed - reset
            localStorage.removeItem(STORAGE_KEY)
          }
        } else if (parsed.state.status === 'paused') {
          // Restore paused state as-is
          setState(parsed.state)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    // Check existing notification permission (don't request yet)
    if ('Notification' in window) {
      notificationPermissionRef.current = Notification.permission
    }
  }, [])

  // Persist state changes
  useEffect(() => {
    if (state.status === 'running' || state.status === 'paused') {
      const persisted: PersistedPomodoroState = {
        state,
        settings,
        savedAt: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    } else if (state.status === 'idle') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [state, settings])

  // Save settings changes
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  // Get duration for current phase
  const getPhaseDuration = useCallback((phase: PomodoroPhase): number => {
    switch (phase) {
      case 'work':
        return settings.workDuration * 60
      case 'shortBreak':
        return settings.shortBreakDuration * 60
      case 'longBreak':
        return settings.longBreakDuration * 60
    }
  }, [settings])

  // Show notification
  const showNotification = useCallback((title: string, body: string) => {
    if (settings.notificationsEnabled && notificationPermissionRef.current === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' })
    }
  }, [settings.notificationsEnabled])

  // Play sound
  const playSound = useCallback(() => {
    if (settings.soundEnabled) {
      // Create a simple beep using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch {
        // Audio not supported
      }
    }
  }, [settings.soundEnabled])

  // Guard against double-firing of phase completion (React Strict Mode)
  const phaseCompleteGuardRef = useRef(false)

  // Handle phase completion
  const handlePhaseComplete = useCallback(() => {
    if (phaseCompleteGuardRef.current) return
    phaseCompleteGuardRef.current = true

    playSound()

    let completedPhase: PomodoroPhase = 'work'
    let newCycles = 0
    let taskDescription: string | undefined

    setState(prev => {
      completedPhase = prev.phase
      taskDescription = prev.currentTaskDescription

      const wasWork = prev.phase === 'work'
      const cyclesCompleted = wasWork ? prev.cyclesCompleted + 1 : prev.cyclesCompleted
      const totalWorkMinutes = wasWork ? prev.totalWorkMinutes + settings.workDuration : prev.totalWorkMinutes

      let nextPhase: PomodoroPhase
      if (wasWork) {
        nextPhase = cyclesCompleted % settings.cyclesBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak'
      } else {
        nextPhase = 'work'
      }

      newCycles = cyclesCompleted

      return {
        ...prev,
        phase: nextPhase,
        cyclesCompleted,
        totalWorkMinutes,
        timeRemaining: getPhaseDuration(nextPhase),
        status: (wasWork ? settings.autoStartBreaks : settings.autoStartWork) ? 'running' : 'paused'
      }
    })

    // Defer side effects to avoid setState-during-render in consumers
    setTimeout(() => {
      if (completedPhase === 'work') {
        showNotification('🎉 Pomodoro Complete!', `Great work! Time for a break.`)
        onWorkComplete?.(settings.workDuration, taskDescription)
      } else {
        showNotification('⏰ Break Over!', 'Ready to focus again?')
      }
      onPhaseComplete?.(completedPhase, newCycles)
      phaseCompleteGuardRef.current = false
    }, 0)
  }, [settings, getPhaseDuration, showNotification, playSound, onPhaseComplete, onWorkComplete])

  // Timer tick
  useEffect(() => {
    if (state.status === 'running') {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            // Phase complete - will be handled by handlePhaseComplete
            return { ...prev, timeRemaining: 0 }
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 }
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state.status])

  // Check for phase completion
  useEffect(() => {
    if (state.status === 'running' && state.timeRemaining === 0) {
      handlePhaseComplete()
    }
  }, [state.timeRemaining, state.status, handlePhaseComplete])

  // Control functions
  const start = useCallback((taskId?: string, taskDescription?: string) => {
    // Request notification permission on user-initiated start
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        notificationPermissionRef.current = permission
      })
    }
    setState(prev => ({
      ...prev,
      status: 'running',
      currentTaskId: taskId,
      currentTaskDescription: taskDescription,
      sessionStartedAt: prev.sessionStartedAt || new Date().toISOString()
    }))
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, status: 'paused' }))
  }, [])

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, status: 'running' }))
  }, [])

  const stop = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState({
      status: 'idle',
      phase: 'work',
      timeRemaining: settings.workDuration * 60,
      cyclesCompleted: 0,
      totalWorkMinutes: 0
    })
  }, [settings.workDuration])

  const skip = useCallback(() => {
    handlePhaseComplete()
  }, [handlePhaseComplete])

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeRemaining: getPhaseDuration(prev.phase),
      status: 'idle'
    }))
  }, [getPhaseDuration])

  const updateSettings = useCallback((newSettings: Partial<DeepWorkSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      // Update time remaining if idle and work phase
      if (state.status === 'idle' && state.phase === 'work' && newSettings.workDuration) {
        setState(s => ({ ...s, timeRemaining: newSettings.workDuration! * 60 }))
      }
      return updated
    })
  }, [state.status, state.phase])

  const setTask = useCallback((taskId?: string, taskDescription?: string) => {
    setState(prev => ({
      ...prev,
      currentTaskId: taskId,
      currentTaskDescription: taskDescription
    }))
  }, [])

  const progress = ((getPhaseDuration(state.phase) - state.timeRemaining) / getPhaseDuration(state.phase)) * 100

  return {
    state,
    settings,
    formattedTime: formatTime(state.timeRemaining),
    progress,
    isRunning: state.status === 'running',
    isPaused: state.status === 'paused',
    isIdle: state.status === 'idle',
    isWorkPhase: state.phase === 'work',
    isBreakPhase: state.phase === 'shortBreak' || state.phase === 'longBreak',
    start,
    pause,
    resume,
    stop,
    skip,
    reset,
    setTask,
    updateSettings
  }
}
