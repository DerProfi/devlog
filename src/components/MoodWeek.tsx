'use client'

import { useEffect, useState } from 'react'
import { DevLogEntry, MoodValue } from '@/types/devlog'
import { useTranslations, useFormatter } from 'next-intl'
import { FaSadTear, FaMeh, FaSmile, FaGrin, FaBolt } from 'react-icons/fa'

export default function MoodWeek() {
  const t = useTranslations('mood')
  const format = useFormatter()
  const [logs, setLogs] = useState<DevLogEntry[]>([])

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/devlogs?limit=14')
      const json = await res.json()
      if (json?.success) setLogs(json.data.devLogs)
    }
    run()
  }, [])

  const days = buildDays(logs, format)

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono" style={{ color: 'var(--dl-text)' }}>{t('title')}</div>
        <div className="text-xs font-mono" style={{ color: 'var(--dl-muted)' }}>{t('weekDays')}</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const today = new Date()
          const dayDate = new Date(today)
          const dow = dayDate.getDay()
          const mondayOffset = dow === 0 ? -6 : 1 - dow
          dayDate.setDate(today.getDate() + mondayOffset + i)
          const isToday = dayDate.toDateString() === today.toDateString()
          
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div 
                className="aspect-square w-full rounded-lg border flex items-center justify-center"
                style={{ 
                  borderColor: isToday ? 'var(--dl-accent)' : 'var(--dl-border)',
                  background: d.mood ? 'var(--dl-accent-weak)' : 'var(--dl-surface)',
                  borderWidth: isToday ? '2px' : '1px'
                }}
                title={d.label}
              >
                {d.mood ? (() => {
                  const Icon = moodIcon(d.mood)
                  return Icon ? <Icon className="text-xl" /> : null
                })() : null}
              </div>
              <div className="text-[10px] font-mono" style={{ color: 'var(--dl-muted)' }}>
                {d.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function buildDays(logs: DevLogEntry[], formatter: ReturnType<typeof useFormatter>) {
  const today = new Date()
  const start = new Date(today)
  // Start on Monday of current week
  const dow = start.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  start.setDate(start.getDate() + mondayOffset)

  return Array.from({ length: 7 }, (_, idx) => {
    const date = new Date(start)
    date.setDate(start.getDate() + idx)
    const dateISO = date.toISOString().split('T')[0]
    const found = logs.find(l => {
      const logDate = new Date(l.date).toISOString().split('T')[0]
      return logDate === dateISO
    })

    // Support both formats: direct mood field or mood in modules
    let mood: number | undefined
    if (found) {
      // Try direct mood field first (new format)
      if (typeof (found as any).mood === 'number') {
        mood = (found as any).mood
      }
      // Fallback to modules.mood (old format)
      else if (found.modules?.mood) {
        const mv = found.modules.mood as MoodValue | undefined
        mood = mv?.mood
      }
    }

    return {
      label: formatter.dateTime(date, { weekday: 'short' }),
      mood
    }
  })
}

function moodIcon(m?: number) {
  if (!m) return null
  // Map 1-5 to icons (1=Erschöpft, 2=Schlecht, 3=Neutral, 4=Gut, 5=Energiegeladen)
  const icons: Record<number, typeof FaSadTear> = {
    1: FaSadTear, // Erschöpft
    2: FaMeh, // Schlecht
    3: FaSmile, // Neutral
    4: FaGrin, // Gut
    5: FaBolt  // Energiegeladen
  }
  return icons[m] ?? null
}


