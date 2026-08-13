import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticateCLI, createSuccessResponse, createErrorResponse } from '@/lib/cliAuth'

// GET - Get specific DevLog by date
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ date: string }> }
) {
  const { user, error } = await authenticateCLI(request)

  if (error || !user) {
    return NextResponse.json(
      createErrorResponse(error || 'Authentication failed', 'UNAUTHORIZED'),
      { status: 401 }
    )
  }

  try {
    const { date } = await context.params

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        createErrorResponse('Invalid date format. Use YYYY-MM-DD', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    const { data: devLog, error: queryError } = await supabaseAdmin()
      .from('dev_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single()

    if (queryError && queryError.code !== 'PGRST116') { // Not found is ok
      throw queryError
    }

    if (!devLog) {
      return NextResponse.json(
        createErrorResponse(`No DevLog found for date: ${date}`, 'NOT_FOUND'),
        { status: 404 }
      )
    }

    return NextResponse.json(createSuccessResponse(devLog))

  } catch (error) {
    console.error('CLI GET devlog by date error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to fetch DevLog', 'FETCH_ERROR'),
      { status: 500 }
    )
  }
}

// PATCH - Update DevLog
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ date: string }> }
) {
  const { user, error } = await authenticateCLI(request)

  if (error || !user) {
    return NextResponse.json(
      createErrorResponse(error || 'Authentication failed', 'UNAUTHORIZED'),
      { status: 401 }
    )
  }

  try {
    const { date } = await context.params
    const body = await request.json()
    const { title, modules, tags, template, isPublic } = body

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        createErrorResponse('Invalid date format. Use YYYY-MM-DD', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    // Get existing log
    const { data: existingLog } = await supabaseAdmin()
      .from('dev_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single()

    if (!existingLog) {
      return NextResponse.json(
        createErrorResponse(`No DevLog found for date: ${date}`, 'NOT_FOUND'),
        { status: 404 }
      )
    }

    // Update log
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (modules !== undefined) updateData.modules = { ...existingLog.modules, ...modules }
    if (tags !== undefined) updateData.tags = tags
    if (template !== undefined) updateData.template = template
    if (isPublic !== undefined) updateData.is_public = isPublic

    const { data: updatedLog, error: updateError } = await supabaseAdmin()
      .from('dev_logs')
      .update(updateData)
      .eq('id', existingLog.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json(createSuccessResponse(updatedLog))

  } catch (error) {
    console.error('CLI PATCH devlog error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to update DevLog', 'UPDATE_ERROR'),
      { status: 500 }
    )
  }
}

// DELETE - Delete DevLog
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ date: string }> }
) {
  const { user, error } = await authenticateCLI(request)

  if (error || !user) {
    return NextResponse.json(
      createErrorResponse(error || 'Authentication failed', 'UNAUTHORIZED'),
      { status: 401 }
    )
  }

  try {
    const { date } = await context.params

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        createErrorResponse('Invalid date format. Use YYYY-MM-DD', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    const { data: deletedLog, error: deleteError } = await supabaseAdmin()
      .from('dev_logs')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date)
      .select()
      .single()

    if (deleteError && deleteError.code !== 'PGRST116') {
      throw deleteError
    }

    if (!deletedLog) {
      return NextResponse.json(
        createErrorResponse(`No DevLog found for date: ${date}`, 'NOT_FOUND'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      createSuccessResponse({
        message: 'DevLog deleted successfully',
        deletedLog
      })
    )

  } catch (error) {
    console.error('CLI DELETE devlog error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to delete DevLog', 'DELETE_ERROR'),
      { status: 500 }
    )
  }
}
