import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSessionFromRequest } from '@/lib/auth'
import { UpdateGoalInput, GoalWithProgress, GoalCriterion } from '@/types/goals'
import { Task } from '@/types/devlog'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = getSessionFromRequest(request)

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params

    const { data: goal, error } = await supabaseAdmin()
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', sessionData.userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Goal not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Calculate progress
    const { data: devLogs } = await supabaseAdmin()
      .from('dev_logs')
      .select('tasks')
      .eq('user_id', sessionData.userId)
      .gte('date', goal.start_date)
      .lte('date', goal.end_date)

    let totalTasks = 0
    let completedTasks = 0

    if (devLogs) {
      devLogs.forEach((log: { tasks: Task[] }) => {
        const tasks = log.tasks || []
        tasks.forEach((task: Task) => {
          if (task.goal_id === goal.id) {
            totalTasks++
            if (task.completed) {
              completedTasks++
            }
          }
        })
      })
    }

    // Calculate criteria progress
    const criteria: GoalCriterion[] = goal.criteria || []
    const totalCriteriaTarget = criteria.reduce((sum: number, c: GoalCriterion) => sum + c.target_value, 0)
    const totalCriteriaCurrent = criteria.reduce((sum: number, c: GoalCriterion) => sum + Math.min(c.current_value, c.target_value), 0)
    const criteriaProgressPercentage = totalCriteriaTarget > 0
      ? Math.round((totalCriteriaCurrent / totalCriteriaTarget) * 100)
      : 0

    // Combined progress: average of tasks and criteria (if both exist)
    let progressPercentage = 0
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    if (totalTasks > 0 && totalCriteriaTarget > 0) {
      progressPercentage = Math.round((taskProgress + criteriaProgressPercentage) / 2)
    } else if (totalTasks > 0) {
      progressPercentage = taskProgress
    } else if (totalCriteriaTarget > 0) {
      progressPercentage = criteriaProgressPercentage
    }

    const goalWithProgress: GoalWithProgress = {
      ...goal,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      progress_percentage: progressPercentage,
      criteria_progress_percentage: criteriaProgressPercentage
    }

    return NextResponse.json({
      success: true,
      data: goalWithProgress
    })

  } catch (error) {
    console.error('Get goal error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = getSessionFromRequest(request)

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body: UpdateGoalInput = await request.json()

    // Validate period_type if provided
    if (body.period_type && !['weekly', 'monthly', 'quarterly'].includes(body.period_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid period_type. Must be weekly, monthly, or quarterly' },
        { status: 400 }
      )
    }

    // Validate status if provided
    if (body.status && !['active', 'completed', 'archived'].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be active, completed, or archived' },
        { status: 400 }
      )
    }

    // Validate date format if provided
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (body.start_date && !dateRegex.test(body.start_date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid start_date format. Expected YYYY-MM-DD' },
        { status: 400 }
      )
    }
    if (body.end_date && !dateRegex.test(body.end_date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid end_date format. Expected YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Validate color if provided
    if (body.color && !/^#[0-9A-Fa-f]{6}$/.test(body.color)) {
      return NextResponse.json(
        { success: false, error: 'Invalid color format. Expected hex color like #3B82F6' },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.period_type !== undefined) updateData.period_type = body.period_type
    if (body.start_date !== undefined) updateData.start_date = body.start_date
    if (body.end_date !== undefined) updateData.end_date = body.end_date
    if (body.status !== undefined) updateData.status = body.status
    if (body.color !== undefined) updateData.color = body.color
    if (body.criteria !== undefined) {
      // Validate criteria if provided
      if (Array.isArray(body.criteria)) {
        for (const criterion of body.criteria) {
          if (!criterion.title || typeof criterion.target_value !== 'number' || criterion.target_value < 1) {
            return NextResponse.json(
              { success: false, error: 'Invalid criteria: each criterion must have a title and target_value >= 1' },
              { status: 400 }
            )
          }
        }
      }
      updateData.criteria = body.criteria
    }

    const { data: goal, error } = await supabaseAdmin()
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', sessionData.userId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Goal not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: goal
    })

  } catch (error) {
    console.error('Update goal error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = getSessionFromRequest(request)

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params

    const { error } = await supabaseAdmin()
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', sessionData.userId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully'
    })

  } catch (error) {
    console.error('Delete goal error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
