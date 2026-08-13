import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSessionFromRequest } from '@/lib/auth'
import { GoalWithProgress, Goal, GoalCriterion } from '@/types/goals'
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

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Get all active goals where today falls within the date range
    const { data: goals, error } = await supabaseAdmin()
      .from('goals')
      .select('*')
      .eq('user_id', sessionData.userId)
      .eq('status', 'active')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('period_type', { ascending: true }) // weekly first, then monthly, then quarterly

    if (error) throw error

    // Calculate progress for each goal
    const goalsWithProgress: GoalWithProgress[] = await Promise.all(
      (goals || []).map(async (goal: Goal) => {
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
    console.error('Get active goals error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
