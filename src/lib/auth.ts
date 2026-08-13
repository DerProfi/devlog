import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

function getJWTSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined in environment variables')
  }
  return secret
}

export interface SessionData {
  userId: string
  githubId: number
  username: string
}

/**
 * Creates a signed JWT token for the session
 */
export function createSessionToken(data: SessionData): string {
  return jwt.sign(data, getJWTSecret(), {
    expiresIn: '30d',
    algorithm: 'HS256'
  })
}

/**
 * Verifies and decodes a JWT session token
 * Returns null if token is invalid or expired
 */
export function verifySessionToken(token: string): SessionData | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret(), {
      algorithms: ['HS256']
    }) as SessionData
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extracts and verifies session from request cookies
 * Returns session data or null if invalid
 */
export function getSessionFromRequest(request: NextRequest): SessionData | null {
  const sessionToken = request.cookies.get('session')?.value

  if (!sessionToken) {
    return null
  }

  return verifySessionToken(sessionToken)
}

/**
 * Creates a random CSRF token
 */
export function createCSRFToken(): string {
  // Generate a random 32-byte token
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
