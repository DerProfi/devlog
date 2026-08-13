'use client'

import { useState, useEffect } from 'react'
import { GoalWithProgress } from '@/types/goals'
import { useTranslations } from 'next-intl'
import { FaPlus, FaTimes } from 'react-icons/fa'

interface GoalTagProps {
  goalId?: string
  onGoalSelect: (goalId: string | undefined) => void
  disabled?: boolean
}

export default function GoalTag({ goalId, onGoalSelect, disabled }: GoalTagProps) {
  const t = useTranslations('goals')
  const [activeGoals, setActiveGoals] = useState<GoalWithProgress[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [clickY, setClickY] = useState(0)

  useEffect(() => {
    if (isOpen && activeGoals.length === 0) {
      fetchActiveGoals()
    }
  }, [isOpen])

  const fetchActiveGoals = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/goals/active')
      const data = await response.json()

      if (data.success) {
        setActiveGoals(data.data)
      }
    } catch (err) {
      console.error('Error fetching active goals:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedGoal = activeGoals.find((g) => g.id === goalId)

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setClickY(e.clientY)
      setIsOpen(true)
    }
  }

  const handleSelectGoal = (e: React.MouseEvent, newGoalId: string) => {
    e.preventDefault()
    e.stopPropagation()
    onGoalSelect(newGoalId)
    setIsOpen(false)
  }

  const handleRemoveGoal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onGoalSelect(undefined)
  }

  // If a goal is selected, show it as a tag
  if (goalId && selectedGoal) {
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono cursor-pointer"
        style={{
          backgroundColor: `${selectedGoal.color}20`,
          color: selectedGoal.color,
          border: `1px solid ${selectedGoal.color}40`
        }}
        onClick={handleRemoveGoal}
        title={t('removeGoal')}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: selectedGoal.color }}
        />
        <span className="max-w-[100px] truncate">{selectedGoal.name}</span>
        <FaTimes className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
      </div>
    )
  }

  // If goal is selected but not in active goals yet (still loading), show placeholder
  if (goalId && !selectedGoal) {
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono"
        style={{
          background: 'var(--dl-surface-2)',
          color: 'var(--dl-muted)',
          border: '1px solid var(--dl-border)'
        }}
      >
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--dl-muted)' }} />
        <span>...</span>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono transition-colors hover:opacity-80 disabled:opacity-50"
        style={{
          background: 'var(--dl-surface-2)',
          color: 'var(--dl-muted)',
          border: '1px solid var(--dl-border)'
        }}
        title={t('addGoal')}
      >
        <FaPlus className="w-2.5 h-2.5" />
        <span>{t('goal')}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex justify-center"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(false)
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Modal */}
          <div
            className="absolute w-64 max-h-80 rounded-xl py-2 overflow-y-auto"
            style={{
              top: `clamp(1rem, ${clickY}px - 1rem, calc(100vh - 22rem))`,
              background: 'var(--dl-surface)',
              border: '1px solid var(--dl-border)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--dl-border)' }}>
              <span className="text-sm font-mono" style={{ color: 'var(--dl-text)' }}>{t('addGoal')}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                className="p-1 rounded hover:opacity-80"
                style={{ color: 'var(--dl-muted)' }}
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>

            <div className="py-1">
              {isLoading ? (
                <div className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>
                  {t('loading')}
                </div>
              ) : activeGoals.length === 0 ? (
                <div className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>
                  {t('noActiveGoals')}
                </div>
              ) : (
                activeGoals.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={(e) => handleSelectGoal(e, goal.id)}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-opacity hover:opacity-80"
                    style={{ color: 'var(--dl-text)' }}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: goal.color }}
                    />
                    <span className="text-sm font-mono truncate">{goal.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
