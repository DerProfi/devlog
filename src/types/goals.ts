export type PeriodType = 'weekly' | 'monthly' | 'quarterly'
export type GoalStatus = 'active' | 'completed' | 'archived'

export interface GoalCriterion {
  id: string
  title: string
  target_value: number  // Ziel (z.B. 5)
  current_value: number // Aktuell (z.B. 2)
}

export interface Goal {
  id: string
  user_id: string
  name: string
  description: string | null
  period_type: PeriodType
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  status: GoalStatus
  color: string // Hex color like #3B82F6
  criteria: GoalCriterion[]
  created_at: string
  updated_at: string
}

export interface GoalWithProgress extends Goal {
  total_tasks: number
  completed_tasks: number
  progress_percentage: number
  criteria_progress_percentage: number // Progress from criteria only
}

export interface CreateGoalInput {
  name: string
  description?: string
  period_type: PeriodType
  start_date: string
  end_date: string
  color?: string
  criteria?: GoalCriterion[]
}

export interface UpdateGoalInput {
  name?: string
  description?: string
  period_type?: PeriodType
  start_date?: string
  end_date?: string
  status?: GoalStatus
  color?: string
  criteria?: GoalCriterion[]
}
