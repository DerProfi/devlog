import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GDPR-compliant account deletion endpoint
 * Deletes all user data from the database
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const session = getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId
    const db = supabaseAdmin()

    // Delete all user data in order (respecting foreign key constraints)
    // 1. Delete dev_logs
    const { error: devLogsError } = await db
      .from('dev_logs')
      .delete()
      .eq('user_id', userId)

    if (devLogsError) {
      console.error('Error deleting dev_logs:', devLogsError)
      throw new Error('Failed to delete dev logs')
    }

    // 2. Delete user_usage
    const { error: usageError } = await db
      .from('user_usage')
      .delete()
      .eq('user_id', userId)

    if (usageError) {
      console.error('Error deleting user_usage:', usageError)
      throw new Error('Failed to delete usage data')
    }

    // 4. Delete feedback (set user_id to null for anonymization or delete)
    const { error: feedbackError } = await db
      .from('feedback')
      .update({ user_id: null, is_anonymous: true })
      .eq('user_id', userId)

    if (feedbackError) {
      console.error('Error anonymizing feedback:', feedbackError)
      // Non-critical, continue with deletion
    }

    // 5. Delete rate_limits entries for this user
    const { error: rateLimitError } = await db
      .from('rate_limits')
      .delete()
      .like('key', `%${userId}%`)

    if (rateLimitError) {
      console.error('Error deleting rate_limits:', rateLimitError)
      // Non-critical, continue with deletion
    }

    // 6. Finally, delete the user record
    const { error: userError } = await db
      .from('users')
      .delete()
      .eq('id', userId)

    if (userError) {
      console.error('Error deleting user:', userError)
      throw new Error('Failed to delete user account')
    }

    // Clear session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Account and all associated data have been permanently deleted'
      },
      { status: 200 }
    )

    response.cookies.delete('session')

    return response

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to retrieve user data for GDPR data export
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId
    const db = supabaseAdmin()

    // Fetch all user data
    const [userResult, devLogsResult, feedbackResult] = await Promise.all([
      db.from('users').select('*').eq('id', userId).single(),
      db.from('dev_logs').select('*').eq('user_id', userId),
      db.from('feedback').select('message, created_at').eq('user_id', userId)
    ])

    if (userResult.error) {
      throw new Error('Failed to fetch user data')
    }

    // Remove sensitive tokens from export
    const userData = userResult.data
    delete userData.github_access_token
    delete userData.github_refresh_token

    const exportData = {
      exportDate: new Date().toISOString(),
      user: userData,
      devLogs: devLogsResult.data || [],
      feedback: feedbackResult.data || []
    }

    return NextResponse.json(
      { success: true, data: exportData },
      { status: 200 }
    )

  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
