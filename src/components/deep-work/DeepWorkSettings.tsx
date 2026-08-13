'use client'

import { useState } from 'react'
import { DeepWorkSettings as DeepWorkSettingsType, DEFAULT_DEEP_WORK_SETTINGS } from '@/types/deepWork'
import { FaTimes, FaCog } from 'react-icons/fa'

interface DeepWorkSettingsProps {
  settings: DeepWorkSettingsType
  onUpdateSettings: (settings: Partial<DeepWorkSettingsType>) => void
  disabled?: boolean
}

export default function DeepWorkSettingsModal({
  settings,
  onUpdateSettings,
  disabled = false
}: DeepWorkSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

  const handleOpen = () => {
    setLocalSettings(settings)
    setIsOpen(true)
  }

  const handleSave = () => {
    onUpdateSettings(localSettings)
    setIsOpen(false)
  }

  const handleReset = () => {
    setLocalSettings(DEFAULT_DEEP_WORK_SETTINGS)
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm"

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={disabled}
        className="p-2 rounded-lg transition-all hover:opacity-80"
        style={{
          backgroundColor: 'var(--dl-surface)',
          color: 'var(--dl-muted)'
        }}
        title="Timer Settings"
      >
        <FaCog size={16} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl p-6 shadow-2xl"
            style={{
              backgroundColor: 'var(--dl-surface)',
              border: '1px solid var(--dl-border)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg font-semibold"
                style={{ color: 'var(--dl-text)' }}
              >
                Timer Settings
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:opacity-70 transition-opacity"
                style={{ color: 'var(--dl-muted)' }}
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Duration Settings */}
            <div className="space-y-4 mb-6">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: 'var(--dl-muted)' }}
                >
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={localSettings.workDuration}
                  onChange={e => setLocalSettings(s => ({
                    ...s,
                    workDuration: Math.max(1, Math.min(120, parseInt(e.target.value) || 25))
                  }))}
                  className={inputClass}
                  style={{
                    backgroundColor: 'var(--dl-bg)',
                    border: '1px solid var(--dl-border)',
                    color: 'var(--dl-text)'
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: 'var(--dl-muted)' }}
                >
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={localSettings.shortBreakDuration}
                  onChange={e => setLocalSettings(s => ({
                    ...s,
                    shortBreakDuration: Math.max(1, Math.min(30, parseInt(e.target.value) || 5))
                  }))}
                  className={inputClass}
                  style={{
                    backgroundColor: 'var(--dl-bg)',
                    border: '1px solid var(--dl-border)',
                    color: 'var(--dl-text)'
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: 'var(--dl-muted)' }}
                >
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={localSettings.longBreakDuration}
                  onChange={e => setLocalSettings(s => ({
                    ...s,
                    longBreakDuration: Math.max(1, Math.min(60, parseInt(e.target.value) || 15))
                  }))}
                  className={inputClass}
                  style={{
                    backgroundColor: 'var(--dl-bg)',
                    border: '1px solid var(--dl-border)',
                    color: 'var(--dl-text)'
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: 'var(--dl-muted)' }}
                >
                  Cycles before Long Break
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={localSettings.cyclesBeforeLongBreak}
                  onChange={e => setLocalSettings(s => ({
                    ...s,
                    cyclesBeforeLongBreak: Math.max(1, Math.min(10, parseInt(e.target.value) || 4))
                  }))}
                  className={inputClass}
                  style={{
                    backgroundColor: 'var(--dl-bg)',
                    border: '1px solid var(--dl-border)',
                    color: 'var(--dl-text)'
                  }}
                />
              </div>
            </div>

            {/* Toggle Settings */}
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoStartBreaks}
                  onChange={e => setLocalSettings(s => ({
                    ...s,
                    autoStartBreaks: e.target.checked
                  }))}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--dl-accent)' }}
                />
                <span style={{ color: 'var(--dl-text)' }}>Auto-start breaks</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoStartWork}
                  onChange={e => setLocalSettings(s => ({
                    ...s,
                    autoStartWork: e.target.checked
                  }))}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--dl-accent)' }}
                />
                <span style={{ color: 'var(--dl-text)' }}>Auto-start focus after break</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={e => setLocalSettings(s => ({
                    ...s,
                    soundEnabled: e.target.checked
                  }))}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--dl-accent)' }}
                />
                <span style={{ color: 'var(--dl-text)' }}>Sound notifications</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.notificationsEnabled}
                  onChange={e => setLocalSettings(s => ({
                    ...s,
                    notificationsEnabled: e.target.checked
                  }))}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--dl-accent)' }}
                />
                <span style={{ color: 'var(--dl-text)' }}>Browser notifications</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80"
                style={{
                  color: 'var(--dl-muted)',
                  border: '1px solid var(--dl-border)'
                }}
              >
                Reset to Defaults
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80"
                  style={{
                    color: 'var(--dl-muted)',
                    border: '1px solid var(--dl-border)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-sm text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--dl-accent)' }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
