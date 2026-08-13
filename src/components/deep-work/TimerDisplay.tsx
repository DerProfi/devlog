'use client'

import { PomodoroPhase } from '@/types/deepWork'

interface TimerDisplayProps {
  formattedTime: string
  progress: number
  phase: PomodoroPhase
  isRunning: boolean
  size?: number
  compact?: boolean
}

export default function TimerDisplay({
  formattedTime,
  progress,
  phase,
  isRunning,
  size = 200,
  compact = false
}: TimerDisplayProps) {
  const strokeWidth = compact ? 6 : 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const getPhaseColor = () => {
    switch (phase) {
      case 'work':
        return 'var(--dl-accent)'
      case 'shortBreak':
        return '#3b82f6' // blue
      case 'longBreak':
        return '#8b5cf6' // purple
    }
  }

  const getPhaseLabel = () => {
    switch (phase) {
      case 'work':
        return 'Focus'
      case 'shortBreak':
        return 'Short Break'
      case 'longBreak':
        return 'Long Break'
    }
  }

  const color = getPhaseColor()

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--dl-border)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>

      {/* Time display in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`${compact ? 'text-2xl' : 'text-4xl'} font-mono font-bold`}
          style={{ color: 'var(--dl-text)' }}
        >
          {formattedTime}
        </span>
        <span
          className={`${compact ? 'text-xs' : 'text-sm'} mt-1 uppercase tracking-wider`}
          style={{ color: 'var(--dl-muted)' }}
        >
          {getPhaseLabel()}
        </span>
        {isRunning && (
          <span
            className={`${compact ? 'w-1.5 h-1.5 mt-1' : 'w-2 h-2 mt-2'} rounded-full animate-pulse`}
            style={{ backgroundColor: color }}
          />
        )}
      </div>
    </div>
  )
}
