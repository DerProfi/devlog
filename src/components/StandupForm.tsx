'use client'

import { useState } from 'react'
import SuggestionPanel from './SuggestionPanel'
import FormField from './FormField'

export interface StandupData {
  yesterday: string
  today: string
  blockers: string
  mood: number
  notes: string
}

export default function StandupForm() {
  const [standupData, setStandupData] = useState<StandupData>({
    yesterday: '',
    today: '',
    blockers: '',
    mood: 5,
    notes: ''
  })

  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save to localStorage or send to an API
    alert('Standup saved successfully!')
  }

  const handleFieldChange = (field: keyof StandupData, value: string | number) => {
    setStandupData(prev => ({ ...prev, [field]: value }))
  }

  const applySuggestion = (suggestion: string, field: keyof StandupData) => {
    setStandupData(prev => ({ ...prev, [field]: suggestion }))
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Daily Standup</h2>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm"
        >
          {showSuggestions ? 'Hide' : 'Show'} Suggestions
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="What did you do yesterday?"
          value={standupData.yesterday}
          onChange={(value) => handleFieldChange('yesterday', value)}
          placeholder="Completed user authentication feature..."
          type="textarea"
        />

        <FormField
          label="What will you do today?"
          value={standupData.today}
          onChange={(value) => handleFieldChange('today', value)}
          placeholder="Working on dashboard UI components..."
          type="textarea"
        />

        <FormField
          label="Any blockers?"
          value={standupData.blockers}
          onChange={(value) => handleFieldChange('blockers', value)}
          placeholder="Waiting for API documentation..."
          type="textarea"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            How&apos;s your mood today?
          </label>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-400">😞</span>
            <input
              type="range"
              min="1"
              max="10"
              value={standupData.mood}
              onChange={(e) => handleFieldChange('mood', parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-slate-400">😊</span>
            <span className="text-sm font-medium w-6">{standupData.mood}</span>
          </div>
        </div>

        <FormField
          label="Additional notes"
          value={standupData.notes}
          onChange={(value) => handleFieldChange('notes', value)}
          placeholder="Any other thoughts or updates..."
          type="textarea"
        />

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02]"
        >
          Save Standup
        </button>
      </form>

      {showSuggestions && (
        <SuggestionPanel onApplySuggestion={applySuggestion} />
      )}
    </div>
  )
}
