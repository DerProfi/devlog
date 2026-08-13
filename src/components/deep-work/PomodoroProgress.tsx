'use client'

interface PomodoroProgressProps {
  cyclesCompleted: number
  cyclesBeforeLongBreak: number
}

export default function PomodoroProgress({ cyclesCompleted, cyclesBeforeLongBreak }: PomodoroProgressProps) {
  // Calculate position in current set
  const currentSetPosition = cyclesCompleted % cyclesBeforeLongBreak
  const completedSets = Math.floor(cyclesCompleted / cyclesBeforeLongBreak)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {Array.from({ length: cyclesBeforeLongBreak }).map((_, index) => {
          const isCompleted = index < currentSetPosition
          return (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isCompleted ? 'scale-110' : ''
              }`}
              style={{
                backgroundColor: isCompleted ? 'var(--dl-accent)' : 'var(--dl-border)',
                opacity: isCompleted ? 1 : 0.4
              }}
              title={isCompleted ? 'Completed' : 'Pending'}
            />
          )
        })}
      </div>

      {cyclesCompleted > 0 && (
        <span
          className="text-xs"
          style={{ color: 'var(--dl-muted)' }}
        >
          {currentSetPosition}/{cyclesBeforeLongBreak}
          {completedSets > 0 && ` (${completedSets} ${completedSets === 1 ? 'set' : 'sets'} done)`}
        </span>
      )}
    </div>
  )
}
