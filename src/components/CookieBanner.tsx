'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'cookie-consent-accepted'

export default function CookieBanner() {
  const t = useTranslations('cookies')
  const [showBanner, setShowBanner] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const hasAccepted = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!hasAccepted) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
    setShowBanner(false)
  }

  if (!mounted || !showBanner) return null

  const banner = (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4"
      style={{ background: 'rgba(10, 10, 10, 0.95)' }}
    >
      <div
        className="max-w-4xl mx-auto rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{
          background: 'var(--dl-surface)',
          border: '1px solid var(--dl-border)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--dl-text-muted)' }}>
          {t('message')}{' '}
          <Link
            href="/privacy"
            className="underline hover:no-underline"
            style={{ color: 'var(--dl-accent)' }}
          >
            {t('learnMore')}
          </Link>
        </p>
        <button
          onClick={handleAccept}
          className="px-6 py-2 rounded-lg text-sm font-mono whitespace-nowrap transition-all hover:opacity-90"
          style={{
            background: 'var(--dl-accent)',
            color: 'white',
          }}
        >
          {t('accept')}
        </button>
      </div>
    </div>
  )

  return createPortal(banner, document.body)
}
