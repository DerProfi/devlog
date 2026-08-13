import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSessionFromRequest } from '@/lib/auth'

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

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

    // Calculate date ranges
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayEnd = now.toISOString()

    // Diese Woche (Montag bis heute)
    const currentDay = now.getDay()
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay // Sonntag = 0, Montag = 1
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset).toISOString()
    const weekEnd = now.toISOString()

    // Letzte 365 Tage (genau 365 Tage zurück bis heute)
    const yearStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 365).toISOString()
    const yearEnd = now.toISOString()

    // Vorherige 365 Tage (730 bis 365 Tage zurück)
    const lastYearStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 730).toISOString()
    const lastYearEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 365).toISOString()

    const query = `
      query GetUserContributions(
        $username: String!
        $todayStart: DateTime!
        $todayEnd: DateTime!
        $weekStart: DateTime!
        $weekEnd: DateTime!
        $yearStart: DateTime!
        $yearEnd: DateTime!
        $lastYearStart: DateTime!
        $lastYearEnd: DateTime!
      ) {
        user(login: $username) {
          name
          email
          avatarUrl

          # Heute
          today: contributionsCollection(from: $todayStart, to: $todayEnd) {
            totalCommitContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
          }

          # Diese Woche
          thisWeek: contributionsCollection(from: $weekStart, to: $weekEnd) {
            totalCommitContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            restrictedContributionsCount
          }

          # Letzte 365 Tage
          thisYear: contributionsCollection(from: $yearStart, to: $yearEnd) {
            totalCommitContributions
            totalIssueContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            totalRepositoryContributions
            restrictedContributionsCount
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  color
                  contributionCount
                  date
                  weekday
                }
              }
            }
          }

          # Vorherige 365 Tage
          lastYear: contributionsCollection(from: $lastYearStart, to: $lastYearEnd) {
            totalCommitContributions
            totalIssueContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            totalRepositoryContributions
            restrictedContributionsCount
            contributionCalendar {
              totalContributions
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
          todayStart,
          todayEnd,
          weekStart,
          weekEnd,
          yearStart,
          yearEnd,
          lastYearStart,
          lastYearEnd
        }
      })
    })

    if (!graphqlResponse.ok) {
      if (graphqlResponse.status === 403) {
        throw new Error('Rate limit exceeded')
      }
      throw new Error(`GitHub API error: ${graphqlResponse.status}`)
    }

    const result = await graphqlResponse.json()

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0].message}`)
    }

    // Berechne durchschnittliche Contributions pro Tag
    const userData = result.data.user
    const thisYearData = userData.thisYear || {}
    const lastYearData = userData.lastYear || {}
    const thisYearCalendar = thisYearData.contributionCalendar || { totalContributions: 0, weeks: [] }
    const lastYearCalendar = lastYearData.contributionCalendar || { totalContributions: 0, weeks: [] }

    // Letzte 365 Tage und vorherige 365 Tage
    const daysInPeriod = 365

    const avgContributionsPerDayThisYear = daysInPeriod > 0 && thisYearCalendar.totalContributions
      ? thisYearCalendar.totalContributions / daysInPeriod
      : 0

    const avgContributionsPerDayLastYear = daysInPeriod > 0 && lastYearCalendar.totalContributions
      ? lastYearCalendar.totalContributions / daysInPeriod
      : 0

    return NextResponse.json({
      success: true,
      data: {
        ...userData,
        metrics: {
          // Heute
          commitsToday: (userData.today || {}).totalCommitContributions || 0,
          prsCreatedToday: (userData.today || {}).totalPullRequestContributions || 0,
          prReviewsToday: (userData.today || {}).totalPullRequestReviewContributions || 0,

          // Diese Woche
          commitsThisWeek: (userData.thisWeek || {}).totalCommitContributions || 0,
          prsCreatedThisWeek: (userData.thisWeek || {}).totalPullRequestContributions || 0,
          prReviewsThisWeek: (userData.thisWeek || {}).totalPullRequestReviewContributions || 0,

          // Jahresmetriken
          totalContributionsThisYear: thisYearCalendar.totalContributions,
          totalContributionsLastYear: lastYearCalendar.totalContributions,

          // Durchschnitte
          avgContributionsPerDayThisYear: Math.round(avgContributionsPerDayThisYear * 100) / 100,
          avgContributionsPerDayLastYear: Math.round(avgContributionsPerDayLastYear * 100) / 100,
        }
      }
    })

  } catch (error) {
    console.error('Error fetching GitHub contributions:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch contributions' },
      { status: 500 }
    )
  }
}
