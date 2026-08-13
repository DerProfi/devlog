export interface DevLogModule {
  id: string
  type: ModuleType
  title: string
  emoji: string
  required: boolean
  order: number
}

export type ModuleType = 
  | 'goals'           // Ziele für heute
  | 'achieved'        // Erreicht / Getan
  | 'problems'        // Probleme / Bugs
  | 'learnings'       // Erkenntnisse / Learnings
  | 'mood'           // Mood / Energielevel
  | 'code_snippets'   // Code Snippets
  | 'meetings'        // Meetings / Calls
  | 'resources'       // Ressourcen / Links
  | 'next_steps'      // Nächste Schritte
  | 'challenges'      // Herausforderungen
  | 'accomplishments' // Erfolge
  | 'time_tracking'   // Zeiterfassung
  | 'tools_used'      // Tools verwendet
  | 'reflection'      // Reflexion
  | 'github_activity' // GitHub Activity

export interface DevLogEntry {
  id: string
  date: string
  title: string
  modules: DevLogModules
  customModules?: DevLogModule[]
}

export interface ModuleData {
  type: ModuleType
  content: string | number | string[]
  // Arbitrary per-module extra data (kept intentionally flexible but typed)
  metadata?: ModuleMetadata
}

// Additional metadata stored alongside a module's content
export type ModuleMetadata = Record<string, unknown>

// Structured value for the mood module
export interface MoodValue {
  mood?: number
  energy?: number
}

// Structured value for the github_activity module
export interface GitHubActivityModuleValue {
  username?: string
  token?: string
  notes?: string
}

// Union of all supported module value shapes used in the app state and DB
export type ModuleValue =
  | string
  | number
  | string[]
  | MoodValue
  | GitHubActivityModuleValue
  | Record<string, unknown>

// Map of module id to its stored value
export type DevLogModules = Record<string, ModuleValue>

export interface DevLogTemplate {
  id: string
  name: string
  description: string
  modules: DevLogModule[]
  isDefault?: boolean
}

// New structured types (clean-cut model)
export interface Task {
  id: string
  description: string
  completed: boolean
  goal_id?: string // Optional link to a goal
}

export interface TimeEntry {
  id: string
  description: string
  duration: number
}

export interface DevLog {
  id: string
  user_id: string
  date: string // YYYY-MM-DD
  title: string | null
  reflection: string
  mood: number | null
  learnings: string[]
  tasks: Task[]
  time_entries: TimeEntry[]
  created_at: string
  updated_at: string
}
