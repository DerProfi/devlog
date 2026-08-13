'use client'

import { useState, useEffect, useCallback } from 'react'
import { GoalWithProgress, PeriodType, GoalStatus, CreateGoalInput, UpdateGoalInput, GoalCriterion } from '@/types/goals'
import { useTranslations } from 'next-intl'
import GoalCard from './GoalCard'
import GoalForm from './GoalForm'
import { FaPlus } from 'react-icons/fa'

type FilterType = 'all' | PeriodType
type StatusFilter = 'all' | GoalStatus

export default function GoalList() {
  const t = useTranslations('goals')
  const tCommon = useTranslations('common')

  const [goals, setGoals] = useState<GoalWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [periodFilter, setPeriodFilter] = useState<FilterType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<GoalWithProgress | null>(null)

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (periodFilter !== 'all') {
        params.append('period_type', periodFilter)
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const url = `/api/goals${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setGoals(data.data)
      } else {
        setError(data.error || t('errorLoad'))
      }
    } catch (err) {
      console.error('Error fetching goals:', err)
      setError(t('errorLoad'))
    } finally {
      setIsLoading(false)
    }
  }, [periodFilter, statusFilter, t])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleCreate = async (data: CreateGoalInput | UpdateGoalInput) => {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error)
    }

    await fetchGoals()
  }

  const handleUpdate = async (data: CreateGoalInput | UpdateGoalInput) => {
    if (!editingGoal) return

    const response = await fetch(`/api/goals/${editingGoal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error)
    }

    await fetchGoals()
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm(t('confirmDelete'))) {
      return
    }

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId))
      } else {
        setError(result.error || t('errorDelete'))
      }
    } catch (err) {
      console.error('Error deleting goal:', err)
      setError(t('errorDelete'))
    }
  }

  const handleEdit = (goal: GoalWithProgress) => {
    setEditingGoal(goal)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingGoal(null)
  }

  const handleOpenNewForm = () => {
    setEditingGoal(null)
    setIsFormOpen(true)
  }

  const handleUpdateCriteria = async (goalId: string, criteria: GoalCriterion[]) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria })
      })

      const result = await response.json()
      if (result.success) {
        // Optimistically update local state
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === goalId) {
              // Recalculate criteria progress
              const totalTarget = criteria.reduce((sum, c) => sum + c.target_value, 0)
              const totalCurrent = criteria.reduce((sum, c) => sum + Math.min(c.current_value, c.target_value), 0)
              const criteriaProgressPercentage = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0

              // Recalculate combined progress
              const taskProgress = g.total_tasks > 0 ? Math.round((g.completed_tasks / g.total_tasks) * 100) : 0
              let progressPercentage = 0

              if (g.total_tasks > 0 && totalTarget > 0) {
                progressPercentage = Math.round((taskProgress + criteriaProgressPercentage) / 2)
              } else if (g.total_tasks > 0) {
                progressPercentage = taskProgress
              } else if (totalTarget > 0) {
                progressPercentage = criteriaProgressPercentage
              }

              return {
                ...g,
                criteria,
                criteria_progress_percentage: criteriaProgressPercentage,
                progress_percentage: progressPercentage
              }
            }
            return g
          })
        )
      } else {
        setError(result.error || t('errorSave'))
      }
    } catch (err) {
      console.error('Error updating criteria:', err)
      setError(t('errorSave'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold font-mono" style={{ color: 'var(--dl-accent)' }}>
          {t('title')}
        </h1>
        <button
          onClick={handleOpenNewForm}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-opacity hover:opacity-80"
          style={{
            background: 'var(--dl-accent)',
            color: 'white'
          }}
        >
          <FaPlus className="w-3 h-3" />
          {t('newGoal')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Period Filter */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)' }}>
          {(['all', 'weekly', 'monthly', 'quarterly'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setPeriodFilter(filter)}
              className="px-3 py-1.5 rounded font-mono text-xs transition-colors"
              style={{
                background: periodFilter === filter ? 'var(--dl-accent-weak)' : 'transparent',
                color: periodFilter === filter ? 'var(--dl-accent)' : 'var(--dl-muted)'
              }}
            >
              {filter === 'all' ? tCommon('all') : t(`period${filter.charAt(0).toUpperCase() + filter.slice(1)}`)}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)' }}>
          {(['all', 'active', 'completed', 'archived'] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className="px-3 py-1.5 rounded font-mono text-xs transition-colors"
              style={{
                background: statusFilter === filter ? 'var(--dl-accent-weak)' : 'transparent',
                color: statusFilter === filter ? 'var(--dl-accent)' : 'var(--dl-muted)'
              }}
            >
              {filter === 'all' ? tCommon('all') : t(`status${filter.charAt(0).toUpperCase() + filter.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 rounded-lg text-sm font-mono"
          style={{
            background: 'var(--dl-danger)',
            color: 'white',
            opacity: 0.9
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: 'var(--dl-accent)' }}
          />
          <p className="font-mono mt-2" style={{ color: 'var(--dl-muted)' }}>
            {t('loading')}
          </p>
        </div>
      )}

      {/* Goals List */}
      {!isLoading && goals.length === 0 && (
        <div
          className="text-center py-12 rounded-lg"
          style={{
            background: 'var(--dl-surface)',
            border: '1px solid var(--dl-border)'
          }}
        >
          <p className="font-mono" style={{ color: 'var(--dl-muted)' }}>
            {t('noGoals')}
          </p>
          <button
            onClick={handleOpenNewForm}
            className="mt-4 px-4 py-2 rounded-lg font-mono text-sm transition-opacity hover:opacity-80"
            style={{
              background: 'var(--dl-accent)',
              color: 'white'
            }}
          >
            {t('createFirst')}
          </button>
        </div>
      )}

      {!isLoading && goals.length > 0 && (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdateCriteria={handleUpdateCriteria}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <GoalForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={editingGoal ? handleUpdate : handleCreate}
        goal={editingGoal}
      />
    </div>
  )
}
