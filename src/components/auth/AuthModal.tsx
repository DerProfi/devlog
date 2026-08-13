'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import GitHubLogin from './GitHubLogin'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="rounded-xl border p-6 max-w-md w-full max-h-[90vh] overflow-y-auto font-mono" style={{ background: 'var(--dl-surface)', borderColor: 'var(--dl-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to right, var(--dl-accent), var(--dl-accent-2))' }}>
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-semibold" style={{ background: 'linear-gradient(to right, var(--dl-accent), var(--dl-accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              DevStandup
            </span>
          </div>
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

        <GitHubLogin />
      </div>
    </div>,
    document.body
  )
}