'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useDeepWork } from '@/contexts/DeepWorkContext'
import { useTranslations, useFormatter } from 'next-intl'
import AuthModal from './auth/AuthModal'
import { MiniTimer } from './deep-work'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const { user, logout, isAuthenticated } = useAuth();
  const { locale, setLocale } = useLanguage();
  const deepWork = useDeepWork();
  const t = useTranslations("header");
  const format = useFormatter();

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  // Click outside handler for user menu and mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !mobileMenuButtonRef.current?.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isUserMenuOpen || isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen, isMobileMenuOpen]);

  return (
    <header
      className="relative z-50"
      style={{
        borderBottom: "1px solid var(--dl-border)",
        background: "var(--dl-surface-2)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 relative">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-none">
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/DevLog_Logo_w.png"
                alt="DevLog Logo"
                width={100}
                height={67}
                className="opacity-80 w-20 sm:w-28 md:w-[150px] h-auto"
              />
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center gap-4 min-w-0">
            {isAuthenticated && (
              <>
                {/* Hamburger button - mobile only */}
                <button
                  ref={mobileMenuButtonRef}
                  className="sm:hidden p-2 rounded-lg transition-colors hover:opacity-80"
                  style={{ color: "var(--dl-text)" }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>

                {/* Desktop nav */}
                <nav className="hidden sm:flex items-center gap-1">
                  <Link
                    href="/devlog"
                    className="px-3 py-1.5 rounded-lg font-mono text-xs transition-colors hover:opacity-80"
                    style={{ color: 'var(--dl-text)' }}
                  >
                    {t('devlog')}
                  </Link>
                  <Link
                    href="/goals"
                    className="px-3 py-1.5 rounded-lg font-mono text-xs transition-colors hover:opacity-80"
                    style={{ color: 'var(--dl-text)' }}
                  >
                    {t('goals')}
                  </Link>
                </nav>
                <MiniTimer
                  state={deepWork.state}
                  settings={deepWork.settings}
                  formattedTime={deepWork.formattedTime}
                  isRunning={deepWork.isRunning}
                  isPaused={deepWork.isPaused}
                  onPause={deepWork.pause}
                  onResume={deepWork.resume}
                  onStop={deepWork.stop}
                />
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-none">
            {isAuthenticated ? (
              <div className="relative z-[60]" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 hover:opacity-80 transition-opacity"
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                    style={{ background: "var(--dl-accent)" }}
                  >
                    <span
                      className="font-bold text-xs sm:text-sm"
                      style={{ color: "white" }}
                    >
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span
                    className="hidden md:block font-mono text-sm"
                    style={{ color: "var(--dl-text)" }}
                  >
                    {user?.username}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                    style={{ color: "var(--dl-text)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-[9999]"
                    style={{
                      background: "var(--dl-surface)",
                      border: "1px solid var(--dl-border)",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {/* Language Switcher */}
                    <div
                      className="px-4 py-2 border-b"
                      style={{ borderColor: "var(--dl-border)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-mono"
                          style={{ color: "var(--dl-text)" }}
                        >
                          {t("language")}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setLocale("de")}
                            className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                              locale === "de" ? "font-bold" : "opacity-60"
                            }`}
                            style={{
                              background:
                                locale === "de"
                                  ? "var(--dl-accent)"
                                  : "transparent",
                              color:
                                locale === "de" ? "white" : "var(--dl-text)",
                            }}
                          >
                            DE
                          </button>
                          <button
                            onClick={() => setLocale("en")}
                            className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                              locale === "en" ? "font-bold" : "opacity-60"
                            }`}
                            style={{
                              background:
                                locale === "en"
                                  ? "var(--dl-accent)"
                                  : "transparent",
                              color:
                                locale === "en" ? "white" : "var(--dl-text)",
                            }}
                          >
                            EN
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Settings Link */}
                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-4 py-2 text-left text-sm font-mono hover:opacity-80 transition-opacity flex items-center space-x-2 border-b"
                      style={{
                        color: "var(--dl-text)",
                        borderColor: "var(--dl-border)",
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{t("settings")}</span>
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm font-mono hover:opacity-80 transition-opacity flex items-center space-x-2"
                      style={{ color: "var(--dl-text)" }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>{t("logout")}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={handleAuthClick}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm font-mono flex items-center gap-1 sm:gap-2"
                  style={{ background: "var(--dl-accent)", color: "white" }}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="hidden sm:inline">{t("signInGithub")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav menu - overlapping content */}
      {isAuthenticated && isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="sm:hidden absolute left-0 right-0 top-full border-t z-50"
          style={{
            background: "var(--dl-surface-2)",
            borderColor: "var(--dl-border)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
          }}
        >
          <nav className="container mx-auto px-3 py-3 flex flex-col gap-1">
            <Link
              href="/devlog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg font-mono text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--dl-text)" }}
            >
              {t("devlog")}
            </Link>
            <Link
              href="/goals"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg font-mono text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--dl-text)" }}
            >
              {t("goals")}
            </Link>
          </nav>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
}
