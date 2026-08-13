'use client'

import { PomodoroState, DeepWorkSettings } from '@/types/deepWork'
import { FaPlay, FaPause, FaStop } from 'react-icons/fa'

interface MiniTimerProps {
  state: PomodoroState
  settings: DeepWorkSettings
  formattedTime: string
  isRunning: boolean
  isPaused: boolean
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onClick?: () => void
}

export default function MiniTimer({
  state,
  formattedTime,
  isRunning,
  isPaused,
  onPause,
  onResume,
  onStop,
  onClick
}: MiniTimerProps) {
  // Only show when timer is active (running or paused)
  if (state.status === 'idle') {
    return null
  }

  const getPhaseColor = () => {
    switch (state.phase) {
      case 'work':
        return 'var(--dl-accent)'
      case 'shortBreak':
        return '#3b82f6'
      case 'longBreak':
        return '#8b5cf6'
    }
  }

  const getPhaseEmoji = () => {
    switch (state.phase) {
      case 'work':
        return '🎯'
      case 'shortBreak':
        return '☕'
      case 'longBreak':
        return '🧘'
    }
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105"
      style={{
        backgroundColor: 'var(--dl-surface)',
        border: `2px solid ${getPhaseColor()}`
      }}
      onClick={onClick}
    >
      {/* Phase indicator */}
      <span className="text-sm">{getPhaseEmoji()}</span>

      {/* Time */}
      <span
        className="font-mono font-medium text-sm"
        style={{ color: 'var(--dl-text)' }}
      >
        {formattedTime}
      </span>

      {/* Quick controls */}
      <div className="flex items-center gap-1 ml-1">
        {isRunning && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPause()
            }}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: '#f59e0b' }}
            title="Pause"
          >
            <FaPause size={10} />
          </button>
        )}

        {isPaused && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onResume()
            }}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: 'var(--dl-accent)' }}
            title="Resume"
          >
            <FaPlay size={10} />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            onStop()
          }}
          className="p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: 'var(--dl-danger)' }}
          title="Stop"
        >
          <FaStop size={10} />
        </button>
      </div>

      {/* Pulse indicator when running */}
      {isRunning && (
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: getPhaseColor() }}
        />
      )}
    </div>
  )
}
