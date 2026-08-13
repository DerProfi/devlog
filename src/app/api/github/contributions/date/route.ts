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

    // Get date from query params
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json(
        { success: false, error: 'Date parameter required (YYYY-MM-DD)' },
        { status: 400 }
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

    // Validate date format
    const targetDate = new Date(dateParam)
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format (use YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    // Fetch contribution data around the target date (± 7 days for context)
    const from = new Date(targetDate)
    from.setDate(from.getDate() - 7)
    const to = new Date(targetDate)
    to.setDate(to.getDate() + 7)

    const query = `
      query GetDateContributions($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                  weekday
                }
              }
            }
          }
        }
      }
    `

    const graphqlResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${serverToken}`,
        'User-Agent': 'DevLog-App'
      },
      body: JSON.stringify({
        query,
        variables: {
          username: user.username,
          from: from.toISOString(),
          to: to.toISOString()
        }
      })
    })

    if (!graphqlResponse.ok) {
      throw new Error(`GitHub API error: ${graphqlResponse.status}`)
    }

    const result = await graphqlResponse.json()

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0].message}`)
    }

    // Extract contribution count for the specific date
    const calendar = result.data.user.contributionsCollection.contributionCalendar
    let dateContributions = 0
    
    calendar.weeks.forEach((week: { contributionDays: { date: string; contributionCount: number }[] }) => {
      week.contributionDays.forEach((day: { date: string; contributionCount: number }) => {
        if (day.date === dateParam) {
          dateContributions = day.contributionCount
        }
      })
    })

    // Also fetch events for that specific day
    const eventsResponse = await fetch(
      `https://api.github.com/users/${user.username}/events/public?per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${serverToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DevLog-App'
        }
      }
    )

    let dayEvents: unknown[] = []
    if (eventsResponse.ok) {
      const allEvents = await eventsResponse.json()
      // Filter events for the specific date
      dayEvents = allEvents.filter((event: { created_at: string }) => {
        const eventDate = new Date(event.created_at).toISOString().split('T')[0]
        return eventDate === dateParam
      })
    }

    // Categorize events
    const eventSummary = {
      commits: 0,
      pullRequests: 0,
      issues: 0,
      reviews: 0,
      other: 0
    }

    ;(dayEvents as Array<{ type: string; payload?: { commits?: Array<unknown> } }>).forEach((event) => {
      switch (event.type) {
        case 'PushEvent':
          eventSummary.commits += event.payload?.commits?.length || 0
          break
        case 'PullRequestEvent':
          eventSummary.pullRequests++
          break
        case 'IssuesEvent':
          eventSummary.issues++
          break
        case 'PullRequestReviewEvent':
        case 'PullRequestReviewCommentEvent':
          eventSummary.reviews++
          break
        default:
          eventSummary.other++
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        date: dateParam,
        contributionCount: dateContributions,
        breakdown: eventSummary,
        events: dayEvents.slice(0, 10), // Return up to 10 events for the day
        username: user.username
      }
    })

  } catch (error) {
    console.error('Error fetching date contributions:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch date contributions' },
      { status: 500 }
    )
  }
}
