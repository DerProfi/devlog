import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify JWT session token
    const sessionData = getSessionFromRequest(request)

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
 
    // Get user's GitHub username
    const { data: user } = await supabaseAdmin()
      .from('users')
      .select('username')
      .eq('id', sessionData.userId)
      .single()

    if (!user?.username) {
      return NextResponse.json(
        { success: false, error: 'GitHub username not found' },
        { status: 404 }
      )
    }

    // Get server token from environment
    const serverToken = process.env.GITHUB_SERVER_TOKEN

    if (!serverToken) {
      return NextResponse.json(
        { success: false, error: 'GitHub server token not configured' },
        { status: 500 }
      )
    }

    // Fetch GitHub events using server token
    const eventsResponse = await fetch(
      `https://api.github.com/users/${user.username}/events/public?per_page=30`,
      {
        headers: {
          'Authorization': `Bearer ${serverToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DevLog-App'
        }
      }
    )

    if (!eventsResponse.ok) {
      throw new Error(`GitHub API error: ${eventsResponse.status}`)
    }

    const events = await eventsResponse.json()

    return NextResponse.json({
      success: true,
      events,
      username: user.username

    })

  } catch (error) {
    console.error('Error fetching GitHub events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GitHub events' },
      { status: 500 }
    )
  }
}