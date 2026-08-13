'use client'

import { useState } from 'react'
import { DevLogModule, GitHubActivityModuleValue } from '@/types/devlog'
import GitHubEvents from './GitHubEvents'
import { FaGithub } from 'react-icons/fa'

interface GitHubModuleProps {
  module: DevLogModule
  value: GitHubActivityModuleValue
  onChange: (value: GitHubActivityModuleValue) => void
}

export default function GitHubModule({ module, value, onChange }: GitHubModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-mono text-slate-300">
          <FaGithub className="inline mr-1" /> {module.title}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm font-mono transition-colors"
        >
          {isExpanded ? 'Hide' : 'Show'} Activity
        </button>
      </div>

      {/* GitHub Activity Display */}
      {isExpanded && (
        <div className="mb-4">
          <GitHubEvents 
            username={value?.username || ''} 
            token={value?.token || ''}
            maxEvents={5}
          />
        </div>
      )}

      {/* Configuration Fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-mono text-slate-400 mb-2">
            GitHub Username
          </label>
          <input
            type="text"
            value={value?.username || ''}
            onChange={(e) => onChange({ ...value, username: e.target.value })}
            placeholder="your-username"
            className="w-full px-3 py-2 bg-transparent border border-green-600/30 rounded font-mono text-green-400 placeholder-green-600/50 focus:border-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-mono text-slate-400 mb-2">
            GitHub Token (optional)
          </label>
          <input
            type="password"
            value={value?.token || ''}
            onChange={(e) => onChange({ ...value, token: e.target.value })}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full px-3 py-2 bg-transparent border border-green-600/30 rounded font-mono text-green-400 placeholder-green-600/50 focus:border-green-500 focus:outline-none"
          />
          <p className="text-xs text-slate-500 mt-1 font-mono">
            For private events and higher rate limits
          </p>
        </div>

        <div>
          <label className="block text-sm font-mono text-slate-400 mb-2">
            Notes about today&apos;s GitHub activity
          </label>
          <textarea
            value={value?.notes || ''}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            placeholder="- Worked on authentication feature&#10;- Fixed critical bug in payment flow&#10;- Reviewed 3 pull requests"
            rows={4}
            className="w-full px-3 py-2 bg-transparent border border-green-600/30 rounded font-mono text-green-400 placeholder-green-600/50 focus:border-green-500 focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  )
}
