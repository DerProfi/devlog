'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'

type Locale = 'de' | 'en'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('de')
  const [messages, setMessages] = useState<any>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load locale from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('devlog-locale')
      if (stored === 'en' || stored === 'de') {
        setLocaleState(stored)
      }
    } catch (error) {
      console.error('Failed to load locale from localStorage:', error)
    }
    setIsHydrated(true)
  }, [])

  // Load messages dynamically when locale changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await import(`@/i18n/locales/${locale}.json`)
        setMessages(msgs.default)
      } catch (error) {
        console.error(`Failed to load messages for locale ${locale}:`, error)
      }
    }
    loadMessages()
  }, [locale])

  // Save locale to localStorage when it changes
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem('devlog-locale', newLocale)
    } catch (error) {
      console.error('Failed to save locale to localStorage:', error)
    }
  }

  // Wait for hydration and messages to load
  if (!isHydrated || !messages) {
    return null // Or a loading spinner
  }

  const value = {
    locale,
    setLocale
  }

  return (
    <LanguageContext.Provider value={value}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="Europe/Berlin"
      >
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
