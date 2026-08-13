// lib/cliAuth.ts
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export interface AuthenticatedUser {
  id: string
  github_id: number
  username: string
  email: string | null
  avatar_url: string | null
  preferences: Record<string, unknown> | null
}

export async function authenticateCLI(request: NextRequest): Promise<{ 
  user: AuthenticatedUser | null, 
  error: string | null 
}> {
  try {
    // 1. Extract Bearer token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        error: 'Missing or invalid authorization header. Expected: Authorization: Bearer <token>'
      }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (!token) {
      return {
        user: null,
        error: 'No token provided'
      }
    }

    // 2. Validate token directly with GitHub API
    const githubResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!githubResponse.ok) {
      return {
        user: null,
        error: 'Invalid or expired GitHub token'
      }
    }

    const githubUser = await githubResponse.json()

    // 3. Find user in Supabase by GitHub ID (not by token!)
    const { data: user, error } = await supabaseAdmin()
      .from('users')
      .select('id, github_id, username, email, avatar_url, preferences')
      .eq('github_id', githubUser.id)  // <- Match by GitHub ID
      .single()

    if (error || !user) {
      return {
        user: null,
        error: 'User not found in database. Please login via web app first.'
      }
    }

    return {
      user: user as AuthenticatedUser,
      error: null
    }

  } catch (error) {
    console.error('CLI authentication error:', error)
    return {
      user: null,
      error: 'Authentication failed'
    }
  }
}

export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }
  }
}

export function createErrorResponse(message: string, code: string) {
  return {
    success: false,
    error: {
      message,
      code
    }
  }
}
