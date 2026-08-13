'use client'

import { FaPlay, FaPause, FaStop, FaStepForward, FaRedo } from 'react-icons/fa'

interface TimerControlsProps {
  isRunning: boolean
  isPaused: boolean
  isIdle: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onSkip: () => void
  onReset: () => void
}

export default function TimerControls({
  isRunning,
  isPaused,
  isIdle,
  onStart,
  onPause,
  onResume,
  onStop,
  onSkip,
  onReset
}: TimerControlsProps) {
  const buttonBaseClass = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200"
  const primaryClass = `${buttonBaseClass} text-white hover:opacity-90`
  const secondaryClass = `${buttonBaseClass} border hover:opacity-80`

  return (
    <div className="flex items-center justify-center gap-3">
      {isIdle && (
        <button
          onClick={onStart}
          className={primaryClass}
          style={{ backgroundColor: 'var(--dl-accent)' }}
        >
          <FaPlay size={14} />
          <span>Start</span>
        </button>
      )}

      {isRunning && (
        <>
          <button
            onClick={onPause}
            className={primaryClass}
            style={{ backgroundColor: '#f59e0b' }}
          >
            <FaPause size={14} />
            <span>Pause</span>
          </button>
          <button
            onClick={onSkip}
            className={secondaryClass}
            style={{
              borderColor: 'var(--dl-border)',
              color: 'var(--dl-muted)'
            }}
            title="Skip to next phase"
          >
            <FaStepForward size={14} />
          </button>
        </>
      )}

      {isPaused && (
        <>
          <button
            onClick={onResume}
            className={primaryClass}
            style={{ backgroundColor: 'var(--dl-accent)' }}
          >
            <FaPlay size={14} />
            <span>Resume</span>
          </button>
          <button
            onClick={onReset}
            className={secondaryClass}
            style={{
              borderColor: 'var(--dl-border)',
              color: 'var(--dl-muted)'
            }}
            title="Reset current phase"
          >
            <FaRedo size={14} />
          </button>
          <button
            onClick={onSkip}
            className={secondaryClass}
            style={{
              borderColor: 'var(--dl-border)',
              color: 'var(--dl-muted)'
            }}
            title="Skip to next phase"
          >
            <FaStepForward size={14} />
          </button>
        </>
      )}

      {(isRunning || isPaused) && (
        <button
          onClick={onStop}
          className={secondaryClass}
          style={{
            borderColor: 'var(--dl-danger)',
            color: 'var(--dl-danger)'
          }}
          title="Stop session"
        >
          <FaStop size={14} />
        </button>
      )}
    </div>
  )
}
