'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FaChartLine, FaSyncAlt, FaTimes } from 'react-icons/fa'
import { useTranslations } from 'next-intl'
import {Locale, useLanguage} from "@/contexts/LanguageContext";
import {LOCALES} from "@/lib/locales";


type SummaryPeriodType = 'week' | 'month' | 'custom'

interface Period {
  type: SummaryPeriodType
  startDate: string
  endDate: string
}

interface GoalAssessment {
  goalId: string
  progressAssessment: string
  focusSuggestions: string[]
}

interface GeneratedSummary {
  period: Period
  goalAssessments: GoalAssessment[]
  goals: Array<{ id: string, name: string }>
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPresetDates(type: Exclude<SummaryPeriodType, 'custom'>) {
  const today = new Date()
  const endDate = toDateInputValue(today)

  if (type === 'month') {
    return { startDate: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)), endDate }
  }

  const start = new Date(today)
  start.setDate(start.getDate() - 6)
  return { startDate: toDateInputValue(start), endDate }
}

export default function SummaryModal() {
  const t = useTranslations('summary')
  const { locale } = useLanguage();
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [periodType, setPeriodType] = useState<SummaryPeriodType>('week')
  const [dates, setDates] = useState(getPresetDates('week'))
  const [summary, setSummary] = useState<GeneratedSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [outputLanguage, setOutputLanguage] = useState<Locale>(locale);

  useEffect(() => setOutputLanguage(locale), [locale]);

  useEffect(() => {
    setMounted(true)
  }, [])

  const close = () => {
    if (!isGenerating) setIsOpen(false)
  }

  const handlePeriodChange = (type: SummaryPeriodType) => {
    setPeriodType(type)
    if (type !== 'custom') setDates(getPresetDates(type))
    setSummary(null)
    setError(null)
  }

  const handleOutputLanguageChange = (locale: Locale) => {
    setOutputLanguage(locale);
  }

  const generate = async () => {
    if (!dates.startDate || !dates.endDate || dates.startDate > dates.endDate) {
      setError(t('invalidPeriod'))
      return
    }

    setIsGenerating(true)
    setError(null)
    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: { type: periodType, startDate: dates.startDate, endDate: dates.endDate },
          language: outputLanguage,
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || t('generateError'))
      }
      setSummary(payload.data as GeneratedSummary)
    } catch (requestError) {
      console.error('Summary generation error:', requestError)
      setError(requestError instanceof Error ? requestError.message : t('generateError'))
    } finally {
      setIsGenerating(false)
    }
  }

  const goalName = (goalId: string) => summary?.goals.find((goal) => goal.id === goalId)?.name || t('goalFallback')

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'var(--dl-surface)', border: '1px solid var(--dl-border)' }}
      >
        <span className="flex items-center gap-2 font-semibold" style={{ color: 'var(--dl-text)' }}>
          <FaChartLine style={{ color: 'var(--dl-accent)' }} />
          {t('openButton')}
        </span>
        <span className="mt-1 block text-sm" style={{ color: 'var(--dl-muted)' }}>{t('openDescription')}</span>
      </button>

      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="summary-modal-title"
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--dl-surface)', border: '1px solid var(--dl-border)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 id="summary-modal-title" className="text-lg font-semibold" style={{ color: 'var(--dl-text)' }}>{t('title')}</h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--dl-muted)' }}>{t('description')}</p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={isGenerating}
                aria-label={t('close')}
                className="rounded p-1 transition-opacity hover:opacity-70 disabled:cursor-not-allowed"
                style={{ color: 'var(--dl-muted)' }}
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <label className="block text-sm" style={{ color: 'var(--dl-muted)' }}>
                {t('periodLabel')}
                <select
                  value={periodType}
                  onChange={(event) => handlePeriodChange(event.target.value as SummaryPeriodType)}
                  disabled={isGenerating}
                  className="mt-2 w-full rounded-lg px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: 'var(--dl-bg)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
                >
                  <option value="week">{t('periods.week')}</option>
                  <option value="month">{t('periods.month')}</option>
                  <option value="custom">{t('periods.custom')}</option>
                </select>
              </label>

              {periodType === 'custom' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm" style={{ color: 'var(--dl-muted)' }}>
                    {t('startDate')}
                    <input
                      type="date"
                      value={dates.startDate}
                      max={dates.endDate || undefined}
                      onChange={(event) => {
                        setDates((current) => ({ ...current, startDate: event.target.value }))
                        setSummary(null)
                      }}
                      disabled={isGenerating}
                      className="mt-2 w-full rounded-lg px-3 py-2 text-sm disabled:opacity-60"
                      style={{ backgroundColor: 'var(--dl-bg)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
                    />
                  </label>
                  <label className="block text-sm" style={{ color: 'var(--dl-muted)' }}>
                    {t('endDate')}
                    <input
                      type="date"
                      value={dates.endDate}
                      min={dates.startDate || undefined}
                      onChange={(event) => {
                        setDates((current) => ({ ...current, endDate: event.target.value }))
                        setSummary(null)
                      }}
                      disabled={isGenerating}
                      className="mt-2 w-full rounded-lg px-3 py-2 text-sm disabled:opacity-60"
                      style={{ backgroundColor: 'var(--dl-bg)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
                    />
                  </label>
                </div>
              )}
              <label className="block text-sm" style={{ color: 'var(--dl-muted)' }}>
                {t("outputLanguage")}
                <select
                    value={outputLanguage}
                    onChange={(event) => handleOutputLanguageChange(event.target.value as Locale)}
                    disabled={isGenerating}
                    className="mt-2 w-full rounded-lg px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: 'var(--dl-bg)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' }}
                >
                  {LOCALES.map((locale) => (
                      <option key={locale} value={locale}>{locale.toUpperCase()}</option>
                  ))}
                </select>
              </label>


              {error && (
                <p className="rounded-lg p-3 text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--dl-danger)', color: 'var(--dl-danger)' }}>
                  {error}
                </p>
              )}
            </div>

            {summary && (
              <section className="mb-6 space-y-4" aria-live="polite">
                <p className="text-sm" style={{ color: 'var(--dl-muted)' }}>
                  {summary.period.startDate} – {summary.period.endDate}
                </p>
                {summary.goalAssessments.map((assessment) => (
                  <article key={assessment.goalId} className="rounded-lg p-4" style={{ backgroundColor: 'var(--dl-bg)', border: '1px solid var(--dl-border)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--dl-text)' }}>{goalName(assessment.goalId)}</h3>
                    <p className="mt-2 text-sm leading-6" style={{ color: 'var(--dl-muted)' }}>{assessment.progressAssessment}</p>
                    <h4 className="mt-4 text-sm font-semibold" style={{ color: 'var(--dl-text)' }}>{t('focusSuggestions')}</h4>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--dl-muted)' }}>
                      {assessment.focusSuggestions.map((suggestion, index) => <li key={`${assessment.goalId}-${index}`}>{suggestion}</li>)}
                    </ul>
                  </article>
                ))}
              </section>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={close}
                disabled={isGenerating}
                className="rounded-lg px-4 py-2 text-sm transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: 'var(--dl-muted)', border: '1px solid var(--dl-border)' }}
              >
                {t('close')}
              </button>
              <button
                type="button"
                onClick={generate}
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: 'var(--dl-accent)' }}
              >
                {isGenerating && <FaSyncAlt className="animate-spin" />}
                {summary ? t('regenerate') : t('generate')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
