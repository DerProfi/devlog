import { supabaseAdmin } from '@/lib/supabase'
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

type EnforceOpts = { key: string; limit: number; windowSec: number }

async function redisIncr(key: string, windowSec: number) {
  const url = `${REDIS_URL}/pipeline`
  const now = Math.floor(Date.now() / 1000)
  const ttlKey = `rl:${key}:${Math.floor(now / windowSec)}`
  const body = JSON.stringify([
    ['INCR', ttlKey],
    ['EXPIRE', ttlKey, String(windowSec)]
  ])
  const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' }, body })
  if (!res.ok) throw new Error('Redis error')
  const data = await res.json()
  return Number(data?.result?.[0]?.result ?? 0)
}

export async function enforceRateLimit({ key, limit, windowSec }: EnforceOpts) {
  // Prefer Redis if configured
  if (REDIS_URL && REDIS_TOKEN) {
    const count = await redisIncr(key, windowSec)
    if (count > limit) {
      return { ok: false, count, limit, retryAfterSec: windowSec }
    }
    return { ok: true, count, limit }
  }

  // Supabase fallback (fixed window)
  const now = new Date()
  const windowStart = new Date(Math.floor(now.getTime() / (windowSec * 1000)) * windowSec * 1000).toISOString()

  const { data } = await supabaseAdmin()
    .from('rate_limits')
    .select('count')
    .eq('key', key)
    .eq('window_start', windowStart)
    .maybeSingle()

  const count = (data?.count ?? 0) + 1
  const upsert = await supabaseAdmin()
    .from('rate_limits')
    .upsert({ key, window_start: windowStart, count }, { onConflict: 'key,window_start' })
  if (upsert.error) throw upsert.error

  if (count > limit) {
    return { ok: false, count, limit, retryAfterSec: windowSec }
  }
  return { ok: true, count, limit }
}

export function rateKeyFromRequest(req: Request, userId?: string) {
  if (userId) return `u:${userId}`
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'ip:unknown').split(',')[0].trim()
  return `ip:${ip}`
}