import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function assertSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
}

// For server-side operations (API routes)
export const supabaseAdmin: () => SupabaseClient<any> = (() => {
  let client: SupabaseClient<any> | null = null
  return () => {
    assertSupabaseEnv()
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey!
    if (!client) client = createClient<any>(supabaseUrl!, adminKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    return client
  }
})()

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          github_id: number
          username: string
          email: string | null
          avatar_url: string | null
          github_access_token: string | null
          github_refresh_token: string | null
          name: string | null
          bio: string | null
          location: string | null
          company: string | null
          blog: string | null
          public_repos: number
          public_gists: number
          followers: number
          following: number
          preferences: Record<string, unknown> | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          github_id: number
          username: string
          email?: string | null
          avatar_url?: string | null
          github_access_token?: string | null
          github_refresh_token?: string | null
          name?: string | null
          bio?: string | null
          location?: string | null
          company?: string | null
          blog?: string | null
          public_repos?: number
          public_gists?: number
          followers?: number
          following?: number
          preferences?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          github_id?: number
          username?: string
          email?: string | null
          avatar_url?: string | null
          github_access_token?: string | null
          github_refresh_token?: string | null
          name?: string | null
          bio?: string | null
          location?: string | null
          company?: string | null
          blog?: string | null
          public_repos?: number
          public_gists?: number
          followers?: number
          following?: number
          preferences?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      dev_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          title: string | null
          reflection: string
          mood: number | null
          learnings: string[]
          tasks: Array<{ id: string; description: string; completed: boolean; goal_id?: string }>
          time_entries: Array<{ id: string; description: string; duration: number }>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          title?: string | null
          reflection?: string
          mood?: number | null
          learnings?: string[]
          tasks?: Array<{ id: string; description: string; completed: boolean; goal_id?: string }>
          time_entries?: Array<{ id: string; description: string; duration: number }>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          title?: string | null
          reflection?: string
          mood?: number | null
          learnings?: string[]
          tasks?: Array<{ id: string; description: string; completed: boolean; goal_id?: string }>
          time_entries?: Array<{ id: string; description: string; duration: number }>
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          period_type: 'weekly' | 'monthly' | 'quarterly'
          start_date: string
          end_date: string
          status: 'active' | 'completed' | 'archived'
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          period_type: 'weekly' | 'monthly' | 'quarterly'
          start_date: string
          end_date: string
          status?: 'active' | 'completed' | 'archived'
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          period_type?: 'weekly' | 'monthly' | 'quarterly'
          start_date?: string
          end_date?: string
          status?: 'active' | 'completed' | 'archived'
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      rate_limits: {
        Row: {
          key: string
          window_start: string
          count: number
        }
        Insert: {
          key: string
          window_start: string
          count?: number
        }
        Update: {
          key?: string
          window_start?: string
          count?: number
        }
      },
      user_usage: {
        Row: {
          user_id: string
          action: string
          period_start: string
          period: 'day' | 'month'
          used: number
        }
        Insert: {
          user_id: string
          action: string
          period_start: string
          period: 'day' | 'month'
          used?: number
        }
        Update: {
          user_id?: string
          action?: string
          period_start?: string
          period?: 'day' | 'month'
          used?: number
        }
      },
      feedback: {
        Row: {
          id: string
          message: string
          user_id: string | null
          is_anonymous: boolean
          user_agent: string | null
          page_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          message: string
          user_id?: string | null
          is_anonymous?: boolean
          user_agent?: string | null
          page_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          message?: string
          user_id?: string | null
          is_anonymous?: boolean
          user_agent?: string | null
          page_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
