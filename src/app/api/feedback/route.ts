import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSessionFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Optional auth check (don't block if not authenticated)
    let userId: string | null = null

    const sessionData = getSessionFromRequest(request)
    if (sessionData) {
      userId = sessionData.userId
    }

    // Parse request body
    const body = await request.json()
    const { message, is_anonymous = false } = body

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Message must be 2000 characters or less' },
        { status: 400 }
      )
    }

    // Prepare feedback data
    const feedbackData = {
      message: message.trim(),
      user_id: is_anonymous ? null : userId,
      is_anonymous,
      user_agent: request.headers.get('user-agent'),
      page_url: request.headers.get('referer')
    }

    // Insert into database
    const { data, error } = await supabaseAdmin()
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single()

    if (error) {
      console.error('Feedback insert error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
