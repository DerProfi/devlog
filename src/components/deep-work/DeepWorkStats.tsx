'use client'

import { FaClock, FaFire } from 'react-icons/fa'

interface DeepWorkStatsProps {
  totalWorkMinutes: number
  cyclesCompleted: number
}

export default function DeepWorkStats({ totalWorkMinutes, cyclesCompleted }: DeepWorkStatsProps) {
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  if (totalWorkMinutes === 0 && cyclesCompleted === 0) {
    return null
  }

  return (
    <div
      className="flex items-center justify-center gap-6 text-sm py-3 px-4 rounded-lg"
      style={{ backgroundColor: 'var(--dl-surface)' }}
    >
      <div className="flex items-center gap-2" title="Total focus time today">
        <FaClock size={14} style={{ color: 'var(--dl-accent)' }} />
        <span style={{ color: 'var(--dl-muted)' }}>Today:</span>
        <span style={{ color: 'var(--dl-text)' }} className="font-medium">
          {formatDuration(totalWorkMinutes)}
        </span>
      </div>

      <div
        className="w-px h-4"
        style={{ backgroundColor: 'var(--dl-border)' }}
      />

      <div className="flex items-center gap-2" title="Completed pomodoros">
        <FaFire size={14} style={{ color: '#f59e0b' }} />
        <span style={{ color: 'var(--dl-muted)' }}>Pomodoros:</span>
        <span style={{ color: 'var(--dl-text)' }} className="font-medium">
          {cyclesCompleted}
        </span>
      </div>
    </div>
  )
}
