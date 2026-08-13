'use client'

import { GoalWithProgress, PeriodType, GoalCriterion } from '@/types/goals'
import { useTranslations } from 'next-intl'
import { FaEdit, FaTrash, FaMinus, FaPlus } from 'react-icons/fa'

interface GoalCardProps {
  goal: GoalWithProgress
  onEdit: (goal: GoalWithProgress) => void
  onDelete: (goalId: string) => void
  onUpdateCriteria?: (goalId: string, criteria: GoalCriterion[]) => void
}

export default function GoalCard({ goal, onEdit, onDelete, onUpdateCriteria }: GoalCardProps) {
  const t = useTranslations('goals')

  const getPeriodLabel = (periodType: PeriodType): string => {
    switch (periodType) {
      case 'weekly':
        return t('periodWeekly')
      case 'monthly':
        return t('periodMonthly')
      case 'quarterly':
        return t('periodQuarterly')
      default:
        return periodType
    }
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  }

  const isExpired = new Date(goal.end_date) < new Date()
  const isActive = goal.status === 'active' && !isExpired

  const updateCriterionValue = (criterionId: string, delta: number) => {
    if (!onUpdateCriteria) return
    const criteria = goal.criteria || []
    const updatedCriteria = criteria.map(c => {
      if (c.id === criterionId) {
        const newValue = Math.max(0, Math.min(c.current_value + delta, c.target_value))
        return { ...c, current_value: newValue }
      }
      return c
    })
    onUpdateCriteria(goal.id, updatedCriteria)
  }

  return (
    <div
      className="p-4 rounded-lg transition-all"
      style={{
        background: 'var(--dl-surface)',
        border: '1px solid var(--dl-border)',
        opacity: isActive ? 1 : 0.7
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: goal.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="font-mono font-medium truncate"
                style={{ color: 'var(--dl-text)' }}
              >
                {goal.name}
              </h3>
              <span
                className="text-xs px-2 py-0.5 rounded font-mono"
                style={{
                  background: 'var(--dl-surface-2)',
                  color: 'var(--dl-muted)',
                  border: '1px solid var(--dl-border)'
                }}
              >
                {getPeriodLabel(goal.period_type)}
              </span>
              {goal.status === 'completed' && (
                <span
                  className="text-xs px-2 py-0.5 rounded font-mono"
                  style={{
                    background: 'var(--dl-accent-weak)',
                    color: 'var(--dl-accent)'
                  }}
                >
                  {t('statusCompleted')}
                </span>
              )}
              {goal.status === 'archived' && (
                <span
                  className="text-xs px-2 py-0.5 rounded font-mono"
                  style={{
                    background: 'var(--dl-surface-2)',
                    color: 'var(--dl-muted)'
                  }}
                >
                  {t('statusArchived')}
                </span>
              )}
            </div>
            <div className="text-xs font-mono mt-1" style={{ color: 'var(--dl-muted)' }}>
              {formatDate(goal.start_date)} - {formatDate(goal.end_date)} | {goal.completed_tasks}/{goal.total_tasks} {t('tasks')} | {goal.progress_percentage}%
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 rounded hover:opacity-80 transition-opacity"
            style={{ color: 'var(--dl-muted)' }}
            title={t('edit')}
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 rounded hover:opacity-80 transition-opacity"
            style={{ color: 'var(--dl-danger)' }}
            title={t('delete')}
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--dl-surface-2)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${goal.progress_percentage}%`,
              backgroundColor: goal.color
            }}
          />
        </div>
      </div>

      {/* Criteria */}
      {goal.criteria && goal.criteria.length > 0 && (
        <div className="mt-3 space-y-2">
          {goal.criteria.map((criterion) => {
            const progress = criterion.target_value > 0
              ? Math.round((criterion.current_value / criterion.target_value) * 100)
              : 0
            const isComplete = criterion.current_value >= criterion.target_value

            return (
              <div
                key={criterion.id}
                className="flex items-center gap-2 p-2 rounded"
                style={{
                  background: 'var(--dl-surface-2)',
                  opacity: isComplete ? 0.7 : 1
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono truncate"
                      style={{
                        color: isComplete ? 'var(--dl-accent)' : 'var(--dl-text)',
                        textDecoration: isComplete ? 'line-through' : 'none'
                      }}
                    >
                      {criterion.title}
                    </span>
                    <span
                      className="text-xs font-mono flex-shrink-0"
                      style={{ color: 'var(--dl-muted)' }}
                    >
                      {criterion.current_value}/{criterion.target_value}
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div
                    className="h-1 mt-1 rounded-full overflow-hidden"
                    style={{ background: 'var(--dl-border)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: isComplete ? 'var(--dl-accent)' : goal.color
                      }}
                    />
                  </div>
                </div>
                {/* +/- buttons */}
                {onUpdateCriteria && isActive && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => updateCriterionValue(criterion.id, -1)}
                      disabled={criterion.current_value <= 0}
                      className="p-1 rounded transition-opacity disabled:opacity-30"
                      style={{ color: 'var(--dl-muted)' }}
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateCriterionValue(criterion.id, 1)}
                      disabled={criterion.current_value >= criterion.target_value}
                      className="p-1 rounded transition-opacity disabled:opacity-30"
                      style={{ color: 'var(--dl-accent)' }}
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {goal.description && (
        <p
          className="text-sm font-mono mt-2 line-clamp-2"
          style={{ color: 'var(--dl-muted)' }}
        >
          {goal.description}
        </p>
      )}
    </div>
  )
}
