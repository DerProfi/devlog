import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify JWT session token
    const sessionData = getSessionFromRequest(request)

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'No session found or invalid token' },
        { status: 401 }
      )
    }

    // Fetch user from Supabase
    const { data: user, error } = await supabaseAdmin()
      .from('users')
      .select('id, github_id, username, email, avatar_url, name, bio, location, company, blog, public_repos, public_gists, followers, following, preferences, last_login')
      .eq('id', sessionData.userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        githubId: user.github_id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        name: user.name,
        bio: user.bio,
        location: user.location,
        company: user.company,
        blog: user.blog,
        publicRepos: user.public_repos,
        publicGists: user.public_gists,
        followers: user.followers,
        following: user.following,
        preferences: user.preferences,
        lastLogin: user.last_login,
      }
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
