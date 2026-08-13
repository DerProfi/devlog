'use client'

import { useCallback } from 'react'
import { Task, TimeEntry } from '@/types/devlog'
import { PomodoroPhase } from '@/types/deepWork'
import { usePomodoro } from '@/hooks/usePomodoro'
import TimerDisplay from './TimerDisplay'
import TimerControls from './TimerControls'
import PomodoroProgress from './PomodoroProgress'
import TaskSelector from './TaskSelector'
import DeepWorkStats from './DeepWorkStats'
import DeepWorkSettingsModal from './DeepWorkSettings'
import { FaClock } from 'react-icons/fa'

interface DeepWorkTimerProps {
  tasks: Task[]
  onAddTimeEntry?: (entry: TimeEntry) => void
}

export default function DeepWorkTimer({ tasks, onAddTimeEntry }: DeepWorkTimerProps) {
  // Handle completed pomodoro - create time entry
  const handleWorkComplete = useCallback((totalMinutes: number) => {
    if (onAddTimeEntry) {
      const entry: TimeEntry = {
        id: crypto.randomUUID(),
        description: 'Deep Work Session',
        duration: totalMinutes
      }
      onAddTimeEntry(entry)
    }
  }, [onAddTimeEntry])

  const {
    state,
    settings,
    formattedTime,
    progress,
    isRunning,
    isPaused,
    isIdle,
    start,
    pause,
    resume,
    stop,
    skip,
    reset,
    setTask,
    updateSettings
  } = usePomodoro({
    onWorkComplete: handleWorkComplete
  })

  const handleStart = () => {
    start(state.currentTaskId, state.currentTaskDescription)
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: 'var(--dl-surface)',
        border: '1px solid var(--dl-border)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FaClock size={18} style={{ color: 'var(--dl-accent)' }} />
          <h3
            className="text-lg font-semibold"
            style={{ color: 'var(--dl-text)' }}
          >
            Deep Work Timer
          </h3>
        </div>
        <DeepWorkSettingsModal
          settings={settings}
          onUpdateSettings={updateSettings}
          disabled={isRunning}
        />
      </div>

      {/* Timer Display */}
      <div className="flex justify-center mb-6">
        <TimerDisplay
          formattedTime={formattedTime}
          progress={progress}
          phase={state.phase}
          isRunning={isRunning}
        />
      </div>

      {/* Pomodoro Progress */}
      <div className="flex justify-center mb-6">
        <PomodoroProgress
          cyclesCompleted={state.cyclesCompleted}
          cyclesBeforeLongBreak={settings.cyclesBeforeLongBreak}
        />
      </div>

      {/* Task Selector */}
      <div className="mb-6">
        <TaskSelector
          tasks={tasks}
          selectedTaskId={state.currentTaskId}
          onSelectTask={setTask}
          disabled={isRunning}
        />
      </div>

      {/* Controls */}
      <div className="mb-6">
        <TimerControls
          isRunning={isRunning}
          isPaused={isPaused}
          isIdle={isIdle}
          onStart={handleStart}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          onSkip={skip}
          onReset={reset}
        />
      </div>

      {/* Stats */}
      <DeepWorkStats
        totalWorkMinutes={state.totalWorkMinutes}
        cyclesCompleted={state.cyclesCompleted}
      />
    </div>
  )
}
