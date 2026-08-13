import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSessionToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  // Validate CSRF token
  const storedCSRF = request.cookies.get('oauth_csrf')?.value

  let csrfFromState: string | undefined
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
      csrfFromState = decoded.csrf
    } catch (e) {
      console.error('Error decoding state:', e)
    }
  }

  if (!storedCSRF || !csrfFromState || storedCSRF !== csrfFromState) {
    console.error('CSRF token mismatch or missing')
    return NextResponse.redirect(new URL('/?error=csrf_validation_failed', request.url))
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const accessToken = tokenData.access_token

    // Fetch user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })

    const githubUser = await userResponse.json()

    // Fetch user emails
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })

    const emails: { email: string; primary?: boolean }[] = await emailsResponse.json()
    const primaryEmail = emails.find((email) => email.primary)?.email || githubUser.email

    // Check if user exists in Supabase
    const { data: existingUser} = await supabaseAdmin()
      .from('users')
      .select('*')
      .eq('github_id', githubUser.id)
      .maybeSingle()

    let user

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabaseAdmin()
        .from('users')
        .update({
          username: githubUser.login,
          email: primaryEmail,
          avatar_url: githubUser.avatar_url,
          name: githubUser.name,
          bio: githubUser.bio,
          location: githubUser.location,
          company: githubUser.company,
          blog: githubUser.blog,
          public_repos: githubUser.public_repos,
          public_gists: githubUser.public_gists,
          followers: githubUser.followers,
          following: githubUser.following,
          github_access_token: accessToken,
          last_login: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user:', updateError)
        throw new Error('Failed to update user')
      }

      user = updatedUser
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabaseAdmin()
        .from('users')
        .insert({
          github_id: githubUser.id,
          username: githubUser.login,
          email: primaryEmail,
          avatar_url: githubUser.avatar_url,
          name: githubUser.name,
          bio: githubUser.bio,
          location: githubUser.location,
          company: githubUser.company,
          blog: githubUser.blog,
          public_repos: githubUser.public_repos,
          public_gists: githubUser.public_gists,
          followers: githubUser.followers,
          following: githubUser.following,
          github_access_token: accessToken,
          last_login: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user:', insertError)
        throw new Error(`Failed to create user: ${insertError.message}`)
      }

      user = newUser
    }

    if (!user) {
      throw new Error('User creation/update failed - no user data returned')
    }

    // Create secure JWT session token
    const sessionToken = createSessionToken({
      userId: user.id,
      githubId: githubUser.id,
      username: githubUser.login,
    })

    // Decode state to get redirect path
    let redirectTo = '/'
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
        redirectTo = decoded.redirectTo || '/'

        // Validate redirectTo to prevent open redirect
        if (!redirectTo.startsWith('/')) {
          redirectTo = '/'
        }
      } catch (e) {
        console.error('Error decoding state:', e)
      }
    }

    // Create response with redirect
    const response = NextResponse.redirect(new URL(redirectTo, request.url))

    // Set session cookie with JWT
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // Clear CSRF cookie after successful authentication
    response.cookies.delete('oauth_csrf')

    return response

  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error instanceof Error ? error.message : 'Authentication failed')}`, request.url)
    )
  }
}
