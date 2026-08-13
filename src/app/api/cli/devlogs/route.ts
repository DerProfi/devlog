import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticateCLI, createSuccessResponse, createErrorResponse } from '@/lib/cliAuth'

// GET - List all DevLogs for authenticated user
export async function GET(request: NextRequest) {
  const { user, error } = await authenticateCLI(request)

  if (error || !user) {
    return NextResponse.json(
      createErrorResponse(error || 'Authentication failed', 'UNAUTHORIZED'),
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin()
      .from('dev_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    // Add date filters if provided
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    // Execute query with pagination
    const { data: devLogs, error: queryError, count } = await query
      .range(offset, offset + limit - 1)

    if (queryError) throw queryError

    return NextResponse.json(
      createSuccessResponse({
        devLogs: devLogs || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
          hasNext: offset + limit < (count || 0),
          hasPrev: page > 1
        }
      })
    )

  } catch (error) {
    console.error('CLI GET devlogs error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to fetch DevLogs', 'FETCH_ERROR'),
      { status: 500 }
    )
  }
}

// POST - Create or update DevLog
export async function POST(request: NextRequest) {
  const { user, error } = await authenticateCLI(request)

  if (error || !user) {
    return NextResponse.json(
      createErrorResponse(error || 'Authentication failed', 'UNAUTHORIZED'),
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { date, title, modules, tags, template, isPublic } = body

    if (!date) {
      return NextResponse.json(
        createErrorResponse('Date is required (YYYY-MM-DD format)', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    if (!modules) {
      return NextResponse.json(
        createErrorResponse('Modules are required', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        createErrorResponse('Invalid date format. Use YYYY-MM-DD', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    // Check if DevLog already exists for this date
    const { data: existingLog } = await supabaseAdmin()
      .from('dev_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single()

    let devLog

    if (existingLog) {
      // Update existing log
      const { data, error: updateError } = await supabaseAdmin()
        .from('dev_logs')
        .update({
          title: title || existingLog.title,
          modules: { ...existingLog.modules, ...modules },
          tags: tags || existingLog.tags,
          is_public: isPublic !== undefined ? isPublic : existingLog.is_public,
          template: template || existingLog.template
        })
        .eq('id', existingLog.id)
        .select()
        .single()

      if (updateError) throw updateError
      devLog = data
    } else {
      // Create new log
      const { data, error: insertError } = await supabaseAdmin()
        .from('dev_logs')
        .insert({
          user_id: user.id,
          date,
          title: title || `${new Date(date).toLocaleDateString('de-DE')} – Daily Dev Log`,
          modules,
          tags: tags || [],
          is_public: isPublic || false,
          template: template || 'comprehensive'
        })
        .select()
        .single()

      if (insertError) throw insertError
      devLog = data
    }

    return NextResponse.json(
      createSuccessResponse({
        ...devLog,
        action: existingLog ? 'updated' : 'created'
      }),
      { status: existingLog ? 200 : 201 }
    )

  } catch (error) {
    console.error('CLI POST devlog error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to save DevLog', 'SAVE_ERROR'),
      { status: 500 }
    )
  }
}
