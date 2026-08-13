'use client'

import { useState } from 'react'

interface SuggestionPanelProps {
  onApplySuggestion: (suggestion: string, field: 'yesterday' | 'today' | 'blockers') => void
}

const suggestions = {
  yesterday: [
    "Completed feature implementation for user authentication",
    "Fixed critical bug in payment processing",
    "Reviewed and merged 3 pull requests",
    "Attended client meeting to gather requirements",
    "Optimized database queries for better performance",
    "Completed code review for team members",
    "Updated project documentation",
    "Set up CI/CD pipeline for new environment"
  ],
  today: [
    "Implement new dashboard component",
    "Fix reported bugs in user interface",
    "Write unit tests for authentication module",
    "Deploy application to staging environment",
    "Research new technology for project improvement",
    "Prepare presentation for sprint review",
    "Optimize application loading performance",
    "Update API documentation"
  ],
  blockers: [
    "Waiting for API documentation from backend team",
    "Need approval from product manager for design changes",
    "Database migration is blocked due to production issues",
    "Third-party service is experiencing outages",
    "Need access to staging environment credentials",
    "Waiting for security review approval",
    "Dependencies are not compatible with current version",
    "No blockers currently"
  ]
}

export default function SuggestionPanel({ onApplySuggestion }: SuggestionPanelProps) {
  const [activeTab, setActiveTab] = useState<'yesterday' | 'today' | 'blockers'>('yesterday')

  return (
    <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <h3 className="text-lg font-medium mb-4">Quick Suggestions</h3>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-slate-700 rounded-lg p-1">
        {(['yesterday', 'today', 'blockers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-slate-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {suggestions[activeTab].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onApplySuggestion(suggestion, activeTab)}
            className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

