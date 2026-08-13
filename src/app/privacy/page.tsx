'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Header from '@/components/Header'

export default function PrivacyPage() {
  const t = useTranslations('privacy')

  return (
    <div className="min-h-screen" style={{ background: 'var(--dl-bg)' }}>
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--dl-text)' }}>
          {t('title')}
        </h1>

        <div className="space-y-8" style={{ color: 'var(--dl-text-muted)' }}>
          {/* Cookies Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--dl-text)' }}>
              {t('cookies.title')}
            </h2>
            <p className="text-sm mb-4">{t('cookies.description')}</p>
            <ul className="text-sm space-y-2 ml-4">
              <li>• <strong>session</strong> – {t('cookies.session')}</li>
              <li>• <strong>oauth_csrf</strong> – {t('cookies.csrf')}</li>
            </ul>
          </section>

          {/* Data Collection Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--dl-text)' }}>
              {t('dataCollection.title')}
            </h2>
            <p className="text-sm">{t('dataCollection.description')}</p>
          </section>

          {/* Your Rights Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--dl-text)' }}>
              {t('rights.title')}
            </h2>
            <p className="text-sm">{t('rights.description')}</p>
          </section>

          {/* Contact Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--dl-text)' }}>
              {t('contact.title')}
            </h2>
            <p className="text-sm">{t('contact.description')}</p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-sm font-mono hover:underline"
            style={{ color: 'var(--dl-accent)' }}
          >
            {t('backToHome')}
          </Link>
        </div>
      </main>
    </div>
  )
}
