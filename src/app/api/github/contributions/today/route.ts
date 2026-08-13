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

    // Get today's date range
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    // Fetch contribution data for the last week (to get today's data)
    const query = `
      query GetTodayContributions($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            totalIssueContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            contributionCalendar {
              totalContributions
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
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
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

    // Extract today's contributions
    const contributions = result.data.user.contributionsCollection
    const todayStr = today.toISOString().split('T')[0]
    
    let todayContributions = 0
    contributions.contributionCalendar.weeks.forEach((week: { contributionDays: { date: string; contributionCount: number }[] }) => {
      week.contributionDays.forEach((day: { date: string; contributionCount: number }) => {
        if (day.date === todayStr) {
          todayContributions = day.contributionCount
        }
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        date: todayStr,
        contributionCount: todayContributions,
        commits: contributions.totalCommitContributions,
        pullRequests: contributions.totalPullRequestContributions,
        issues: contributions.totalIssueContributions,
        reviews: contributions.totalPullRequestReviewContributions,
        username: user.username
      }
    })

  } catch (error) {
    console.error('Error fetching today\'s contributions:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch today\'s contributions' },
      { status: 500 }
    )
  }
}
