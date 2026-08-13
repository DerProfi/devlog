'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Goal, PeriodType, GoalStatus, CreateGoalInput, UpdateGoalInput, GoalCriterion } from '@/types/goals'
import { useTranslations } from 'next-intl'
import { FaPlus, FaTrash } from 'react-icons/fa'

interface GoalFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateGoalInput | UpdateGoalInput) => Promise<void>
  goal?: Goal | null // If provided, we're editing
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
]

export default function GoalForm({ isOpen, onClose, onSave, goal }: GoalFormProps) {
  const t = useTranslations('goals')
  const tCommon = useTranslations('common')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [periodType, setPeriodType] = useState<PeriodType>('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [status, setStatus] = useState<GoalStatus>('active')
  const [criteria, setCriteria] = useState<GoalCriterion[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate default date range based on period type
  const calculateDateRange = (type: PeriodType) => {
    const today = new Date()
    let start: Date
    let end: Date

    switch (type) {
      case 'weekly':
        // Start of current week (Monday)
        start = new Date(today)
        const dayOfWeek = today.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        start.setDate(today.getDate() + diff)
        end = new Date(start)
        end.setDate(start.getDate() + 6)
        break
      case 'monthly':
        // Start of current month
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'quarterly':
        // Start of current quarter
        const quarter = Math.floor(today.getMonth() / 3)
        start = new Date(today.getFullYear(), quarter * 3, 1)
        end = new Date(today.getFullYear(), quarter * 3 + 3, 0)
        break
      default:
        start = today
        end = today
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  }

  // Reset form when opening or when goal changes
  useEffect(() => {
    if (isOpen) {
      if (goal) {
        // Editing existing goal
        setName(goal.name)
        setDescription(goal.description || '')
        setPeriodType(goal.period_type)
        setStartDate(goal.start_date)
        setEndDate(goal.end_date)
        setColor(goal.color)
        setStatus(goal.status)
        setCriteria(goal.criteria || [])
      } else {
        // Creating new goal
        setName('')
        setDescription('')
        setPeriodType('weekly')
        const dates = calculateDateRange('weekly')
        setStartDate(dates.start)
        setEndDate(dates.end)
        setColor('#3B82F6')
        setStatus('active')
        setCriteria([])
      }
      setError(null)
    }
  }, [isOpen, goal])

  // Update dates when period type changes (only for new goals)
  const handlePeriodTypeChange = (type: PeriodType) => {
    setPeriodType(type)
    if (!goal) {
      const dates = calculateDateRange(type)
      setStartDate(dates.start)
      setEndDate(dates.end)
    }
  }

  // Criteria management
  const addCriterion = () => {
    const newCriterion: GoalCriterion = {
      id: crypto.randomUUID(),
      title: '',
      target_value: 1,
      current_value: 0
    }
    setCriteria([...criteria, newCriterion])
  }

  const updateCriterion = (id: string, field: keyof GoalCriterion, value: string | number) => {
    setCriteria(criteria.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError(t('errorNameRequired'))
      return
    }

    if (!startDate || !endDate) {
      setError(t('errorDatesRequired'))
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError(t('errorInvalidDateRange'))
      return
    }

    // Validate criteria
    for (const criterion of criteria) {
      if (!criterion.title.trim()) {
        setError(t('errorCriterionTitleRequired'))
        return
      }
      if (criterion.target_value < 1) {
        setError(t('errorCriterionTargetInvalid'))
        return
      }
    }

    setIsSaving(true)

    try {
      // Prepare criteria with trimmed titles
      const cleanedCriteria = criteria.map(c => ({
        ...c,
        title: c.title.trim()
      }))

      if (goal) {
        // Update existing goal
        await onSave({
          name: name.trim(),
          description: description.trim() || undefined,
          period_type: periodType,
          start_date: startDate,
          end_date: endDate,
          color,
          status,
          criteria: cleanedCriteria
        } as UpdateGoalInput)
      } else {
        // Create new goal
        await onSave({
          name: name.trim(),
          description: description.trim() || undefined,
          period_type: periodType,
          start_date: startDate,
          end_date: endDate,
          color,
          criteria: cleanedCriteria
        } as CreateGoalInput)
      }
      onClose()
    } catch (err) {
      setError(t('errorSave'))
      console.error('Error saving goal:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl border p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto font-mono"
        style={{ background: 'var(--dl-surface)', borderColor: 'var(--dl-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--dl-accent)' }}>
            {goal ? t('editGoal') : t('newGoal')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--dl-text)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="p-3 rounded-lg text-sm font-mono"
              style={{
                background: 'var(--dl-danger)',
                color: 'white',
                opacity: 0.9
              }}
            >
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-mono mb-1" style={{ color: 'var(--dl-text)' }}>
              {t('name')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg font-mono"
              style={{
                background: 'var(--dl-surface-2)',
                border: '1px solid var(--dl-border)',
                color: 'var(--dl-text)'
              }}
              placeholder={t('namePlaceholder')}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-mono mb-1" style={{ color: 'var(--dl-text)' }}>
              {t('description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg font-mono resize-none"
              style={{
                background: 'var(--dl-surface-2)',
                border: '1px solid var(--dl-border)',
                color: 'var(--dl-text)'
              }}
              rows={2}
              placeholder={t('descriptionPlaceholder')}
            />
          </div>

          {/* Success Criteria */}
          <div>
            <label className="block text-sm font-mono mb-1" style={{ color: 'var(--dl-text)' }}>
              {t('criteria')}
            </label>
            <div className="space-y-2">
              {criteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={{
                    background: 'var(--dl-surface-2)',
                    border: '1px solid var(--dl-border)'
                  }}
                >
                  <input
                    type="text"
                    value={criterion.title}
                    onChange={(e) => updateCriterion(criterion.id, 'title', e.target.value)}
                    className="flex-1 p-2 rounded font-mono text-sm"
                    style={{
                      background: 'var(--dl-surface)',
                      border: '1px solid var(--dl-border)',
                      color: 'var(--dl-text)'
                    }}
                    placeholder={t('criterionTitle')}
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={criterion.target_value}
                      onChange={(e) => updateCriterion(criterion.id, 'target_value', parseInt(e.target.value) || 1)}
                      className="w-16 p-2 rounded font-mono text-sm text-center"
                      style={{
                        background: 'var(--dl-surface)',
                        border: '1px solid var(--dl-border)',
                        color: 'var(--dl-text)'
                      }}
                    />
                    <span className="text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>
                      {t('targetValue')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCriterion(criterion.id)}
                    className="p-2 rounded hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--dl-danger)' }}
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCriterion}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm transition-colors hover:opacity-80"
                style={{
                  background: 'var(--dl-surface-2)',
                  border: '1px dashed var(--dl-border)',
                  color: 'var(--dl-muted)'
                }}
              >
                <FaPlus className="w-3 h-3" />
                {t('addCriterion')}
              </button>
            </div>
          </div>

          {/* Period Type */}
          <div>
            <label className="block text-sm font-mono mb-1" style={{ color: 'var(--dl-text)' }}>
              {t('periodType')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['weekly', 'monthly', 'quarterly'] as PeriodType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePeriodTypeChange(type)}
                  className="p-2 rounded-lg font-mono text-sm transition-colors"
                  style={{
                    background: periodType === type ? 'var(--dl-accent-weak)' : 'var(--dl-surface-2)',
                    border: `1px solid ${periodType === type ? 'var(--dl-accent)' : 'var(--dl-border)'}`,
                    color: periodType === type ? 'var(--dl-accent)' : 'var(--dl-text)'
                  }}
                >
                  {t(`period${type.charAt(0).toUpperCase() + type.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-mono mb-1" style={{ color: 'var(--dl-text)' }}>
                {t('startDate')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 rounded-lg font-mono"
                style={{
                  background: 'var(--dl-surface-2)',
                  border: '1px solid var(--dl-border)',
                  color: 'var(--dl-text)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-mono mb-1" style={{ color: 'var(--dl-text)' }}>
                {t('endDate')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 rounded-lg font-mono"
                style={{
                  background: 'var(--dl-surface-2)',
                  border: '1px solid var(--dl-border)',
                  color: 'var(--dl-text)'
                }}
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-mono mb-1" style={{ color: 'var(--dl-text)' }}>
              {t('color')}
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    border: color === c ? '3px solid white' : '2px solid transparent',
                    boxShadow: color === c ? '0 0 0 2px var(--dl-accent)' : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Status (only for editing) */}
          {goal && (
            <div>
              <label className="block text-sm font-mono mb-1" style={{ color: 'var(--dl-text)' }}>
                {t('status')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['active', 'completed', 'archived'] as GoalStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className="p-2 rounded-lg font-mono text-sm transition-colors"
                    style={{
                      background: status === s ? 'var(--dl-accent-weak)' : 'var(--dl-surface-2)',
                      border: `1px solid ${status === s ? 'var(--dl-accent)' : 'var(--dl-border)'}`,
                      color: status === s ? 'var(--dl-accent)' : 'var(--dl-text)'
                    }}
                  >
                    {t(`status${s.charAt(0).toUpperCase() + s.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-mono text-sm"
              style={{
                background: 'var(--dl-surface-2)',
                border: '1px solid var(--dl-border)',
                color: 'var(--dl-text)'
              }}
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg font-mono text-sm disabled:opacity-50"
              style={{
                background: 'var(--dl-accent)',
                color: 'white'
              }}
            >
              {isSaving ? t('saving') : tCommon('save')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
