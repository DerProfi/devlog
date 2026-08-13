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

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    const { data: devLog, error } = await supabaseAdmin()
      .from('dev_logs')
      .select('*')
      .eq('user_id', sessionData.userId)
      .eq('date', today)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return NextResponse.json({
      success: true,
      data: devLog || null
    })

  } catch (error) {
    console.error('Get today dev log error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify JWT session token
    const sessionData = getSessionFromRequest(request)

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const {
      reflection = '',
      mood = null,
      learnings = [],
      tasks = [],
      timeEntries = []
    } = body || {}

    // Basic validation
    if (mood !== null) {
      const moodNum = Number(mood)
      if (!Number.isInteger(moodNum) || moodNum < 1 || moodNum > 5) {
        return NextResponse.json(
          { success: false, error: 'mood must be an integer between 1 and 5' },
          { status: 400 }
        )
      }
    }

    if (!Array.isArray(learnings) || !learnings.every((v) => typeof v === 'string')) {
      return NextResponse.json(
        { success: false, error: 'learnings must be a string[]' },
        { status: 400 }
      )
    }

    if (!Array.isArray(tasks) || !tasks.every((t) => t && typeof t.id === 'string' && typeof t.description === 'string' && typeof t.completed === 'boolean')) {
      return NextResponse.json(
        { success: false, error: 'tasks must be an array of {id, description, completed}' },
        { status: 400 }
      )
    }

    if (!Array.isArray(timeEntries) || !timeEntries.every((te) => te && typeof te.id === 'string' && typeof te.description === 'string' && typeof te.duration === 'number' && te.duration >= 0)) {
      return NextResponse.json(
        { success: false, error: 'timeEntries must be an array of {id, description, duration>=0}' },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split('T')[0]

    // Check if dev log already exists for today
    const { data: existingLog } = await supabaseAdmin()
      .from('dev_logs')
      .select('*')
      .eq('user_id', sessionData.userId)
      .eq('date', today)
      .single()

    let devLog

    if (existingLog) {
      // Update existing log
      const { data, error } = await supabaseAdmin()
      .from('dev_logs')
      .update({
        reflection,
        mood,
        learnings,
        tasks,
        time_entries: timeEntries
      })
      .eq('id', existingLog.id)
      .select()
      .single()

      if (error) throw error
      devLog = data
    } else {
      // Create new log for today
      const { data, error } = await supabaseAdmin()
      .from('dev_logs')
      .insert({
        user_id: sessionData.userId,
        date: today,
        reflection,
        mood,
        learnings,
        tasks,
        time_entries: timeEntries
      })
      .select()
      .single()

      if (error) throw error
      devLog = data
    }

    return NextResponse.json({
      success: true,
      data: devLog
    })

  } catch (error) {
    console.error('Save today dev log error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
