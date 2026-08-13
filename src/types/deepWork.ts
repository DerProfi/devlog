// Deep Work Timer Types

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'
export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface DeepWorkSettings {
  workDuration: number          // in minutes, default: 25
  shortBreakDuration: number    // in minutes, default: 5
  longBreakDuration: number     // in minutes, default: 15
  cyclesBeforeLongBreak: number // default: 4
  autoStartBreaks: boolean      // default: false
  autoStartWork: boolean        // default: false
  soundEnabled: boolean         // default: true
  notificationsEnabled: boolean // default: true
}

export const DEFAULT_DEEP_WORK_SETTINGS: DeepWorkSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  notificationsEnabled: true
}

export interface PomodoroState {
  status: PomodoroStatus
  phase: PomodoroPhase
  timeRemaining: number         // in seconds
  cyclesCompleted: number       // completed work cycles in current session
  totalWorkMinutes: number      // total work time accumulated today
  currentTaskId?: string        // optional linked task
  currentTaskDescription?: string
  sessionStartedAt?: string     // ISO timestamp
}

export interface PomodoroSession {
  id: string
  taskId?: string
  taskDescription?: string
  phase: PomodoroPhase
  workDuration: number
  startedAt: string
  completedAt?: string
  totalWorkMinutes: number
  cyclesCompleted: number
}

// Extended TimeEntry for pomodoro tracking
export interface PomodoroTimeEntry {
  id: string
  description: string
  duration: number              // in minutes
  source: 'manual' | 'pomodoro'
  taskId?: string
  completedAt: string           // ISO timestamp
  pomodoroCount: number
}

// localStorage persistence structure
export interface PersistedPomodoroState {
  state: PomodoroState
  settings: DeepWorkSettings
  savedAt: number               // timestamp
}
