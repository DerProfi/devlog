'use client'

import Header from '@/components/Header'
import { GoalList } from '@/components/goals'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'
import { FaExclamationTriangle } from 'react-icons/fa'

export default function GoalsPage() {
  const { isAuthenticated, loading } = useAuth()
  const t = useTranslations('goals')

  return (
    <div className="min-h-screen" style={{ background: 'var(--dl-bg)', color: 'var(--dl-text)' }}>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: 'var(--dl-accent)' }}
            />
          </div>
        ) : !isAuthenticated ? (
          <div
            className="panel p-8 text-center"
            style={{ maxWidth: '500px', margin: '0 auto' }}
          >
            <FaExclamationTriangle
              className="mx-auto mb-4"
              style={{ color: 'var(--dl-warning)', fontSize: '2rem' }}
            />
            <p className="font-mono" style={{ color: 'var(--dl-text)' }}>
              {t('loginRequired')}
            </p>
          </div>
        ) : (
          <div className="panel p-6">
            <GoalList />
          </div>
        )}
      </main>
    </div>
  )
}
