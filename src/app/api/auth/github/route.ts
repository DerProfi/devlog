import { NextRequest, NextResponse } from 'next/server'
import { createCSRFToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  let redirectTo = searchParams.get('redirectTo') || '/'

  // Validate redirectTo to prevent open redirect attacks
  if (!redirectTo.startsWith('/')) {
    redirectTo = '/'
  }

  // GitHub OAuth configuration
  const clientId = process.env.GITHUB_CLIENT_ID
  const scope = 'read:user user:email' // Only public user data and public repos

  if (!clientId) {
    return NextResponse.json(
      { error: 'GitHub OAuth not configured' },
      { status: 500 }
    )
  }

  // Generate CSRF token for security
  const csrfToken = createCSRFToken()

  // Store redirect path and CSRF token in state parameter
  const state = Buffer.from(
    JSON.stringify({ redirectTo, csrf: csrfToken })
  ).toString('base64')

  // Build GitHub OAuth authorization URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/github/callback`,
    scope,
    state,
  })

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

  // Create response with redirect
  const response = NextResponse.redirect(authUrl)

  // Store CSRF token in secure httpOnly cookie for validation in callback
  response.cookies.set('oauth_csrf', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  return response
}
