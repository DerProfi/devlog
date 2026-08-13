'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  username
}: DeleteAccountModalProps) {
  const t = useTranslations('settings')
  const router = useRouter()
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const expectedConfirmText = username

  const handleDelete = async () => {
    // Prevent deletion if username is empty or doesn't match
    if (!expectedConfirmText || confirmText !== expectedConfirmText) {
      setError(t('deleteConfirmError'))
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        credentials: 'same-origin',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Deletion failed')
      }

      // Redirect to home page after successful deletion
      router.push('/')
      router.refresh()

    } catch (error) {
      console.error('Delete error:', error)
      setError(error instanceof Error ? error.message : t('deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-lg p-6"
        style={{
          background: 'var(--dl-surface)',
          border: '1px solid var(--dl-border)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="#ef4444"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2
          className="text-xl font-bold text-center mb-2"
          style={{ color: '#ef4444' }}
        >
          {t('deleteModalTitle')}
        </h2>

        {/* Description */}
        <p
          className="text-sm text-center mb-6"
          style={{ color: 'var(--dl-text-muted)' }}
        >
          {t('deleteModalDescription')}
        </p>

        {/* What will be deleted */}
        <div
          className="rounded-lg p-4 mb-6"
          style={{
            background: 'var(--dl-surface-2)',
            border: '1px solid var(--dl-border)'
          }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--dl-text)' }}>
            {t('deleteModalWhatWillBeDeleted')}
          </p>
          <ul className="text-xs space-y-1" style={{ color: 'var(--dl-text-muted)' }}>
            <li>• {t('deleteModalItem1')}</li>
            <li>• {t('deleteModalItem2')}</li>
            <li>• {t('deleteModalItem3')}</li>
            <li>• {t('deleteModalItem4')}</li>
          </ul>
        </div>

        {/* Confirmation Input */}
        <div className="mb-6">
          <label
            className="block text-sm mb-2"
            style={{ color: 'var(--dl-text)' }}
          >
            {t('deleteModalConfirmLabel', { username: expectedConfirmText })}
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={expectedConfirmText}
            className="w-full px-4 py-2 rounded-lg text-sm font-mono"
            style={{
              background: 'var(--dl-surface-2)',
              border: '1px solid var(--dl-border)',
              color: 'var(--dl-text)'
            }}
          />
          {error && (
            <p className="text-xs mt-2" style={{ color: '#ef4444' }}>
              {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-mono transition-all"
            style={{
              background: 'var(--dl-surface-2)',
              border: '1px solid var(--dl-border)',
              color: 'var(--dl-text)'
            }}
          >
            {t('deleteModalCancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || !expectedConfirmText || confirmText !== expectedConfirmText}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-mono transition-all disabled:opacity-50"
            style={{
              background: '#ef4444',
              color: 'white'
            }}
          >
            {isDeleting ? t('deleteModalDeleting') : t('deleteModalConfirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
