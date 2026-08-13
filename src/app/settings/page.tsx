'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import DeleteAccountModal from '@/components/settings/DeleteAccountModal'

export default function SettingsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const t = useTranslations('settings')
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // Redirect to home if not authenticated
  if (!loading && !isAuthenticated) {
    router.push('/')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--dl-bg)' }}>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <span className="text-sm font-mono" style={{ color: 'var(--dl-text-muted)' }}>
              {t('loading')}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const handleExportData = async () => {
    setIsExporting(true)
    setExportError(null)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'GET',
        credentials: 'same-origin',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Export failed')
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `devlog-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export error:', error)
      setExportError(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--dl-bg)' }}>
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--dl-text)' }}>
          {t('title')}
        </h1>

        {/* Account Info Section */}
        <section
          className="rounded-lg p-6 mb-6"
          style={{
            background: 'var(--dl-surface)',
            border: '1px solid var(--dl-border)'
          }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--dl-text)' }}>
            {t('accountInfo')}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono" style={{ color: 'var(--dl-text-muted)' }}>
                {t('username')}
              </span>
              <span className="text-sm font-mono" style={{ color: 'var(--dl-text)' }}>
                {user?.username}
              </span>
            </div>
            {user?.email && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono" style={{ color: 'var(--dl-text-muted)' }}>
                  {t('email')}
                </span>
                <span className="text-sm font-mono" style={{ color: 'var(--dl-text)' }}>
                  {user.email}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono" style={{ color: 'var(--dl-text-muted)' }}>
                GitHub ID
              </span>
              <span className="text-sm font-mono" style={{ color: 'var(--dl-text)' }}>
                {user?.githubId}
              </span>
            </div>
          </div>
        </section>

        {/* GDPR Data Section */}
        <section
          className="rounded-lg p-6 mb-6"
          style={{
            background: 'var(--dl-surface)',
            border: '1px solid var(--dl-border)'
          }}
        >
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--dl-text)' }}>
            {t('dataPrivacy')}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--dl-text-muted)' }}>
            {t('dataPrivacyDescription')}
          </p>

          {/* Export Data */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--dl-text)' }}>
              {t('exportData')}
            </h3>
            <p className="text-xs mb-3" style={{ color: 'var(--dl-text-muted)' }}>
              {t('exportDataDescription')}
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="px-4 py-2 rounded-lg text-sm font-mono transition-all disabled:opacity-50"
              style={{
                background: 'var(--dl-surface-2)',
                border: '1px solid var(--dl-border)',
                color: 'var(--dl-text)'
              }}
            >
              {isExporting ? t('exporting') : t('exportButton')}
            </button>
            {exportError && (
              <p className="text-xs mt-2" style={{ color: 'var(--dl-error)' }}>
                {exportError}
              </p>
            )}
          </div>

          {/* Delete Account */}
          <div
            className="pt-6"
            style={{ borderTop: '1px solid var(--dl-border)' }}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#ef4444' }}>
              {t('deleteAccount')}
            </h3>
            <p className="text-xs mb-3" style={{ color: 'var(--dl-text-muted)' }}>
              {t('deleteAccountDescription')}
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-mono transition-all hover:opacity-90"
              style={{
                background: '#ef4444',
                color: 'white'
              }}
            >
              {t('deleteAccountButton')}
            </button>
          </div>
        </section>

        {/* Back to DevLog Link */}
        <div className="text-center">
          <button
            onClick={() => router.push('/devlog')}
            className="text-sm font-mono hover:underline"
            style={{ color: 'var(--dl-accent)' }}
          >
            {t('backToDevlog')}
          </button>
        </div>
      </main>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        username={user?.username || ''}
      />
    </div>
  )
}
