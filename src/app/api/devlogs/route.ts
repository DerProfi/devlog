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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    // Fetch user's dev logs
    const { data: devLogs, error, count } = await supabaseAdmin()
      .from('dev_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', sessionData.userId)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        devLogs: devLogs || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get dev logs error:', error)
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
    const { date, title, modules, tags, isPublic, template } = body

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!date || !dateRegex.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Expected YYYY-MM-DD' },
        { status: 400 }
      )
    }

    if (!modules || typeof modules !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Modules are required and must be an object' },
        { status: 400 }
      )
    }

    // Check if dev log already exists for this date
    const { data: existingLog } = await supabaseAdmin()
      .from('dev_logs')
      .select('*')
      .eq('user_id', sessionData.userId)
      .eq('date', date)
      .single()

    let devLog

    if (existingLog) {
      // Update existing log
      const { data, error } = await supabaseAdmin()
        .from('dev_logs')
        .update({
          title: title || existingLog.title,
          modules: { ...existingLog.modules, ...modules },
          tags: tags || existingLog.tags,
          is_public: isPublic !== undefined ? isPublic : existingLog.is_public,
          template: template || existingLog.template,
        })
        .eq('id', existingLog.id)
        .select()
        .single()

      if (error) throw error
      devLog = data
    } else {
      // Create new log
      const { data, error } = await supabaseAdmin()
        .from('dev_logs')
        .insert({
          user_id: sessionData.userId,
          date,
          title: title || `${new Date(date).toLocaleDateString('de-DE')} – Daily Dev Log`,
          modules,
          tags: tags || [],
          is_public: isPublic || false,
          template: template || 'comprehensive'
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
    console.error('Save dev log error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
