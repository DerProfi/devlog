import { supabaseAdmin } from '@/lib/supabase'

type QuotaCheck = {
  userId: string
  action: 'devlog_write' | 'cli_request' | string
  period: 'day' | 'month'
  limit: number
}

export async function checkAndConsumeQuota({ userId, action, period, limit }: QuotaCheck) {
  const now = new Date()
  const periodStart =
    period === 'day'
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10)
      : new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)

  // read current
  const { data, error } = await supabaseAdmin()
    .from('user_usage')
    .select('used')
    .eq('user_id', userId)
    .eq('action', action)
    .eq('period', period)
    .eq('period_start', periodStart)
    .maybeSingle()
  if (error && error.code !== 'PGRST116') throw error

  const used = (data?.used ?? 0) + 1
  if (used > limit) return { ok: false, used: used - 1, limit }

  const upsert = await supabaseAdmin()
    .from('user_usage')
    .upsert(
      { user_id: userId, action, period, period_start: periodStart, used },
      { onConflict: 'user_id,action,period,period_start' }
    )
  if (upsert.error) throw upsert.error

  return { ok: true, used, limit }
}