'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import Link from 'next/link'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations('landing')
  const tCommon = useTranslations('common')

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/devlog')
    }
  }, [isAuthenticated, loading, router])

  // Show loading state or nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dl-bg)', color: 'var(--dl-text)' }}>
        <div>{tCommon('loading')}</div>
      </div>
    )
  }

  // If authenticated, don't render the landing page (redirect will happen)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--dl-bg)', color: 'var(--dl-text)' }}>
      <Header />
      <main className="container mx-auto px-4">
        {/* Hero */}
        <section className="max-w-6xl mx-auto">
          <div className="mt-6 grid md:grid-cols-2 gap-8 items-end">
            {/* Headline left */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span style={{ color: 'var(--dl-text)' }}>{t('hero.title1')}</span>
              <span style={{ color: 'var(--dl-accent)' }}>{t('hero.titleDevlog')}</span>
              <span style={{ color: 'var(--dl-text)' }}>{t('hero.title2')}</span>
              <span style={{ color: 'var(--dl-accent)' }}>{t('hero.titleDev')}</span>
            </h1>

            {/* Right: description + button group */}
            <div className="md:justify-self-end">
              <p className="text-lg mb-4 max-w-md" style={{ color: 'var(--dl-muted)' }}>
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/api/auth/github"
                  className="inline-flex items-center justify-center gap-2 rounded-lg font-medium px-5 py-3 transition-colors"
                  style={{ background: 'var(--dl-accent)', color: 'white' }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.562 21.8 24 17.302 24 12 24 5.373 18.627 0 12 0z"/></svg>
                  {t('hero.ctaLogin')}
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-lg border px-5 py-3 transition-colors"
                  style={{ borderColor: 'var(--dl-border)', background: 'var(--dl-surface-2)', color: 'var(--dl-text)' }}
                >
                  {t('hero.ctaLearnMore')}
                </a>
              </div>
            </div>
          </div>
        </section>

         {/* Showcase: volle Breite unter der Headline/Buttons */}
         <section className="max-w-6xl mx-auto mt-10">
          <div className="relative w-full">
            <div className="absolute -inset-6 rounded-3xl blur-2xl" style={{ background: 'var(--dl-accent)', opacity: 0.2 }} aria-hidden="true"></div>
            <div className="relative w-full rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--dl-accent)', background: 'var(--dl-surface-2)' }}>
              <div className="flex items-center gap-2 px-4 h-10" style={{ borderBottom: '1px solid var(--dl-border)' }}>
                <span className="w-3 h-3 rounded-full" style={{ background: 'var(--dl-danger)' }}></span>
                <span className="w-3 h-3 rounded-full" style={{ background: 'var(--dl-warning)' }}></span>
                <span className="w-3 h-3 rounded-full" style={{ background: 'var(--dl-accent)' }}></span>
                <span className="ml-3 text-xs" style={{ color: 'var(--dl-muted)' }}>daily-devlog.app</span>
              </div>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full"
              >
                <source src="/devlog landing.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/devlog" className="group rounded-xl border p-6 transition-colors" style={{ borderColor: 'var(--dl-border)', background: 'var(--dl-surface-2)' }}>
            <div className="text-2xl mb-3">🗓️</div>
            <h3 className="text-lg font-semibold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--dl-text)' }}>{t('features.goals.title')}</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--dl-muted)' }}>{t('features.goals.description')}</p>
          </Link>
          <Link href="/devlog" className="group rounded-xl border p-6 transition-colors" style={{ borderColor: 'var(--dl-border)', background: 'var(--dl-surface-2)' }}>
            <div className="text-2xl mb-3">📈</div>
            <h3 className="text-lg font-semibold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--dl-text)' }}>{t('features.progress.title')}</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--dl-muted)' }}>{t('features.progress.description')}</p>
          </Link>
          <div className="group rounded-xl border p-6 transition-colors" style={{ borderColor: 'var(--dl-border)', background: 'var(--dl-surface-2)' }}>
            <div className="text-2xl mb-3">😊</div>
            <h3 className="text-lg font-semibold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--dl-text)' }}>{t('features.mood.title')}</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--dl-muted)' }}>{t('features.mood.description')}</p>
          </div>
          <div className="group rounded-xl border p-6 transition-colors" style={{ borderColor: 'var(--dl-border)', background: 'var(--dl-surface-2)' }}>
            <div className="text-2xl mb-3">🔥</div>
            <h3 className="text-lg font-semibold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--dl-text)' }}>{t('features.streak.title')}</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--dl-muted)' }}>{t('features.streak.description')}</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto mt-20 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-sm" style={{ borderTop: '1px solid var(--dl-border)', color: 'var(--dl-muted)' }}>
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-6">
            <Link href="/datenschutz" className="hover:opacity-80 transition-opacity">{t('footer.privacy')}</Link>
            <Link href="/impressum" className="hover:opacity-80 transition-opacity">{t('footer.imprint')}</Link>
          </div>
        </footer>
      </main>
    </div>
  )
}