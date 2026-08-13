'use client'

import { useAuth } from '@/contexts/AuthContext'
import Button from '../ui/Button'
import { FaLock, FaTimesCircle } from 'react-icons/fa'

export default function GitHubLogin() {
  const { loginWithGitHub, error } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-mono mb-2" style={{ color: 'var(--dl-accent)' }}>
          <FaLock className="inline mr-1" /> Sign in with GitHub
        </h2>
        <p className="font-mono text-sm" style={{ color: 'var(--dl-muted)' }}>
          Connect your GitHub account to track your developer activity
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border" style={{ background: 'var(--dl-danger)', borderColor: 'var(--dl-danger)', opacity: 0.2 }}>
          <p className="font-mono text-sm flex items-center gap-1" style={{ color: 'var(--dl-danger)' }}><FaTimesCircle /> {error}</p>
        </div>
      )}

      <div className="space-y-4">
        <Button
          onClick={loginWithGitHub}
          className="w-full flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </Button>

        <div className="text-center">
          <p className="font-mono text-xs" style={{ color: 'var(--dl-muted)' }}>
            By signing in, you agree to share your GitHub activity data
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--dl-surface-2)' }}>
        <h3 className="text-sm font-mono mb-2" style={{ color: 'var(--dl-text)' }}>What we&apos;ll access:</h3>
        <ul className="space-y-1 text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>
          <li>Your public profile information</li>
          <li>Your email address</li>
          <li>Your public repository activity</li>
          <li>Public commits, PRs, and issues</li>
        </ul>
      </div>
    </div>
  )
}
