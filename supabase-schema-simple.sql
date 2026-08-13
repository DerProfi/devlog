-- WICHTIG: Führe dieses SQL in deinem Supabase SQL Editor aus!
-- Dashboard → SQL Editor → New Query → Paste & Run

-- Drop existing tables if they exist (optional, nur beim ersten Mal)
-- DROP TABLE IF EXISTS dev_logs CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id BIGINT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  github_access_token TEXT,
  github_refresh_token TEXT,
  name TEXT,
  bio TEXT,
  location TEXT,
  company TEXT,
  blog TEXT,
  public_repos INTEGER DEFAULT 0,
  public_gists INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{"defaultDevLogTemplate": "comprehensive", "selectedModules": ["goals", "achieved", "problems", "learnings", "mood"], "theme": "dark", "timezone": "Europe/Berlin"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create dev_logs table
CREATE TABLE IF NOT EXISTS dev_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT,
  modules JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  template TEXT DEFAULT 'comprehensive',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create rate_limits table (fallback when Redis is not configured)
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

-- Create user_usage table (quota tracking)
CREATE TABLE IF NOT EXISTS user_usage (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('day', 'month')),
  period_start DATE NOT NULL,
  used INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, action, period, period_start)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dev_logs_user_id ON dev_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_dev_logs_date ON dev_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_dev_logs_user_date ON dev_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Service role can manage dev logs" ON dev_logs;
DROP POLICY IF EXISTS "Service role can manage rate limits" ON rate_limits;
DROP POLICY IF EXISTS "Service role can manage user usage" ON user_usage;

-- Create RLS Policies for users table
-- Note: We use custom session-based auth, so we allow service role operations
CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (true);

-- Create RLS Policies for dev_logs table
CREATE POLICY "Service role can manage dev logs" ON dev_logs
  FOR ALL USING (true);

-- Create RLS Policies for rate_limits table
CREATE POLICY "Service role can manage rate limits" ON rate_limits
  FOR ALL USING (true);

-- Create RLS Policies for user_usage table
CREATE POLICY "Service role can manage user usage" ON user_usage
  FOR ALL USING (true);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop first if exists)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dev_logs_updated_at ON dev_logs;
CREATE TRIGGER update_dev_logs_updated_at BEFORE UPDATE ON dev_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================
-- DevLog data model overhaul
-- =========================

-- Add new structured columns if not present
ALTER TABLE dev_logs
  ADD COLUMN IF NOT EXISTS reflection TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS mood INTEGER,
  ADD CONSTRAINT dev_logs_mood_range CHECK (mood IS NULL OR (mood >= 1 AND mood <= 5)),
  ADD COLUMN IF NOT EXISTS learnings TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS time_entries JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Title derived from date
CREATE OR REPLACE FUNCTION set_title_from_date() RETURNS trigger AS $$
BEGIN
  NEW.title := to_char(NEW.date, 'YYYY-MM-DD');
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dev_logs_title ON dev_logs;
CREATE TRIGGER trg_dev_logs_title
BEFORE INSERT OR UPDATE ON dev_logs
FOR EACH ROW EXECUTE FUNCTION set_title_from_date();

-- Remove legacy modules column if it exists
ALTER TABLE dev_logs DROP COLUMN IF EXISTS modules;
