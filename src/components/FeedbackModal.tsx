'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [mounted, setMounted] = useState(false)
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const { isAuthenticated } = useAuth()
  const t = useTranslations('feedback')
  const tCommon = useTranslations('common')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessage('')
      setIsAnonymous(false)
      setStatusMessage(null)
    }
  }, [isOpen])

  // Auto-dismiss success message
  useEffect(() => {
    if (statusMessage?.type === 'success') {
      const timeout = setTimeout(() => {
        setStatusMessage(null)
        onClose()
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [statusMessage, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (message.trim().length === 0) {
      setStatusMessage({ type: 'error', text: t('errorEmpty') })
      return
    }

    if (message.length > 2000) {
      setStatusMessage({ type: 'error', text: t('errorTooLong') })
      return
    }

    setIsSubmitting(true)
    setStatusMessage(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          is_anonymous: isAnonymous
        })
      })

      const data = await response.json()

      if (data.success) {
        setStatusMessage({ type: 'success', text: t('success') })
        setMessage('')
      } else {
        setStatusMessage({ type: 'error', text: data.error || t('errorSubmit') })
      }
    } catch (error) {
      console.error('Feedback submission error:', error)
      setStatusMessage({ type: 'error', text: t('errorNetwork') })
    } finally {
      setIsSubmitting(false)
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
        className="rounded-xl border p-6 max-w-md w-full max-h-[90vh] overflow-y-auto font-mono"
        style={{ background: 'var(--dl-surface)', borderColor: 'var(--dl-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--dl-accent)' }}>
            {t('title')}
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

        {/* Status Message */}
        {statusMessage && (
          <div
            className="mb-4 p-4 rounded-lg"
            style={{
              background: statusMessage.type === 'success' ? 'var(--dl-accent-weak)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${statusMessage.type === 'success' ? 'var(--dl-accent)' : 'var(--dl-danger)'}`,
            }}
          >
            <p className="font-mono text-sm flex items-center gap-2" style={{ color: statusMessage.type === 'success' ? 'var(--dl-accent)' : 'var(--dl-danger)' }}>
              {statusMessage.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
              {statusMessage.text}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono mb-2 text-sm" style={{ color: 'var(--dl-text)' }}>
              {t('messageLabel')}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-lg font-mono resize-none"
              style={{
                background: 'var(--dl-surface-2)',
                border: '1px solid var(--dl-border)',
                color: 'var(--dl-text)'
              }}
              rows={5}
              placeholder={t('messagePlaceholder')}
              maxLength={2000}
            />
            <div className="mt-1 text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>
              {message.length} / 2000
            </div>
          </div>

          {/* Anonymous checkbox - only show if authenticated */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="anonymous" className="font-mono text-sm" style={{ color: 'var(--dl-text)' }}>
                {t('anonymousLabel')}
              </label>
            </div>
          )}

          {/* Not authenticated notice */}
          {!isAuthenticated && (
            <p className="text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>
              {t('anonymousNotice')}
            </p>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-mono text-sm transition-all"
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
              disabled={isSubmitting || message.trim().length === 0}
              className="px-4 py-2 rounded-lg font-mono text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--dl-accent)', color: 'white' }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('submitting')}
                </div>
              ) : (
                t('submit')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
