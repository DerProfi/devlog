export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffInMs = now.getTime() - d.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return `${Math.floor(diffInDays / 30)} months ago`
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

import { FaGrin, FaSmile, FaMeh, FaSadTear, FaFrown } from 'react-icons/fa'

export function getMoodIcon(mood: number) {
  if (mood >= 8) return FaGrin
  if (mood >= 6) return FaSmile
  if (mood >= 4) return FaMeh
  if (mood >= 2) return FaSadTear
  return FaFrown
}

export function getMoodColor(mood: number): string {
  if (mood >= 8) return 'text-green-400'
  if (mood >= 6) return 'text-blue-400'
  if (mood >= 4) return 'text-yellow-400'
  if (mood >= 2) return 'text-orange-400'
  return 'text-red-400'
}
