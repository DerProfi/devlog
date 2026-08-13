import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSessionFromRequest } from '@/lib/auth'
import { CreateGoalInput, GoalWithProgress, Goal, GoalCriterion } from '@/types/goals'
import { Task } from '@/types/devlog'

export async function GET(request: NextRequest) {
  try {
    const sessionData = getSessionFromRequest(request)

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // filter by status
    const periodType = searchParams.get('period_type') // filter by period type

    let query = supabaseAdmin()
      .from('goals')
      .select('*')
      .eq('user_id', sessionData.userId)
      .order('start_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (periodType) {
      query = query.eq('period_type', periodType)
    }

    const { data: goals, error } = await query

    if (error) throw error

    // Calculate progress for each goal by counting linked tasks
    const goalsWithProgress: GoalWithProgress[] = await Promise.all(
      (goals || []).map(async (goal: Goal) => {
        // Get all dev_logs within the goal's date range
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
        const totalCriteriaTarget = criteria.reduce((sum, c) => sum + c.target_value, 0)
        const totalCriteriaCurrent = criteria.reduce((sum, c) => sum + Math.min(c.current_value, c.target_value), 0)
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

        return {
          ...goal,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          progress_percentage: progressPercentage,
          criteria_progress_percentage: criteriaProgressPercentage
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: goalsWithProgress
    })

  } catch (error) {
    console.error('Get goals error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionData = getSessionFromRequest(request)

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: CreateGoalInput = await request.json()
    const { name, description, period_type, start_date, end_date, color, criteria } = body

    // Validate required fields
    if (!name || !period_type || !start_date || !end_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, period_type, start_date, end_date' },
        { status: 400 }
      )
    }

    // Validate period_type
    if (!['weekly', 'monthly', 'quarterly'].includes(period_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid period_type. Must be weekly, monthly, or quarterly' },
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Expected YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Validate date range
    if (new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        { success: false, error: 'end_date must be greater than or equal to start_date' },
        { status: 400 }
      )
    }

    // Validate color if provided
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json(
        { success: false, error: 'Invalid color format. Expected hex color like #3B82F6' },
        { status: 400 }
      )
    }

    // Validate criteria if provided
    if (criteria && Array.isArray(criteria)) {
      for (const criterion of criteria) {
        if (!criterion.title || typeof criterion.target_value !== 'number' || criterion.target_value < 1) {
          return NextResponse.json(
            { success: false, error: 'Invalid criteria: each criterion must have a title and target_value >= 1' },
            { status: 400 }
          )
        }
      }
    }

    const { data: goal, error } = await supabaseAdmin()
      .from('goals')
      .insert({
        user_id: sessionData.userId,
        name,
        description: description || null,
        period_type,
        start_date,
        end_date,
        color: color || '#3B82F6',
        criteria: criteria || []
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: goal
    })

  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
