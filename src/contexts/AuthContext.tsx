'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  githubId: number
  username: string
  email?: string
  avatarUrl?: string
  name?: string
  bio?: string
  location?: string
  company?: string
  blog?: string
  publicRepos: number
  publicGists: number
  followers: number
  following: number
  preferences: Record<string, unknown> | null
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  loginWithGitHub: () => void
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
  checkAuth: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loginWithGitHub = () => {
    // Redirect to GitHub OAuth
    window.location.href = '/api/auth/github'
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setError(null)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    loginWithGitHub,
    logout,
    updateUser,
    clearError,
    checkAuth,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
