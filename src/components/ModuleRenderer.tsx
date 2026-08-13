'use client'

import { DevLogModule, ModuleValue, MoodValue, GitHubActivityModuleValue } from '@/types/devlog'
import GitHubEvents from './GitHubEvents'
import { FaAngry, FaBolt, FaBrain, FaBug, FaBullseye, FaChartLine, FaCheck, FaClock, FaCode, FaFileAlt, FaGrin, FaLightbulb, FaLink, FaMeh, FaPhone, FaRocket, FaSadTear, FaSmile, FaTools, FaTrophy } from 'react-icons/fa'

interface ModuleRendererProps {
  module: DevLogModule
  value: ModuleValue
  onChange: (value: ModuleValue) => void
}

export default function ModuleRenderer({ module, value, onChange }: ModuleRendererProps) {
  const renderModuleContent = () => {
    switch (module.type) {
      case 'goals':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="- [ ] ..."
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-green-600/30 rounded font-mono text-green-400 placeholder-green-600/50 focus:border-green-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'achieved':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="- ..."
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-green-600/30 rounded font-mono text-green-400 placeholder-green-600/50 focus:border-green-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'problems':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="- ..."
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-red-600/30 rounded font-mono text-red-400 placeholder-red-600/50 focus:border-red-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'learnings':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="- ..."
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-purple-600/30 rounded font-mono text-purple-400 placeholder-purple-600/50 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'mood':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-slate-300 mb-2">Mood:</label>
              <div className="flex items-center space-x-2">
                {[FaMeh, FaSmile, FaGrin, FaSadTear, FaAngry].map((Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onChange({ ...(typeof value === 'object' ? value : {}), mood: index } as MoodValue)}
                    className={`p-2 rounded-lg transition-all ${
                      (value as MoodValue | undefined)?.mood === index ? 'bg-blue-500/20 border-2 border-blue-500' : 'hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="text-2xl" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-mono text-slate-300 mb-2">Energie:</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onChange({ ...(typeof value === 'object' ? value : {}), energy: level } as MoodValue)}
                    className={`px-3 py-2 rounded-lg font-mono transition-all ${
                      (value as MoodValue | undefined)?.energy === level 
                        ? 'bg-green-500/20 border-2 border-green-500 text-green-400' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'code_snippets':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="```javascript&#10;// Your code here&#10;```"
              rows={6}
              className="w-full px-3 py-2 bg-slate-800/50 border border-blue-600/30 rounded font-mono text-blue-400 placeholder-blue-600/50 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'meetings':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="- 10:00 - Team Standup&#10;- 14:00 - Code Review Meeting"
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-cyan-600/30 rounded font-mono text-cyan-400 placeholder-cyan-600/50 focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'resources':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="- [React Docs](https://react.dev)&#10;- [MDN Web Docs](https://developer.mozilla.org)"
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-yellow-600/30 rounded font-mono text-yellow-400 placeholder-yellow-600/50 focus:border-yellow-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'next_steps':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="- [ ] ..."
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-orange-600/30 rounded font-mono text-orange-400 placeholder-orange-600/50 focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'challenges':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="- ..."
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-red-600/30 rounded font-mono text-red-400 placeholder-red-600/50 focus:border-red-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'accomplishments':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="- ..."
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-green-600/30 rounded font-mono text-green-400 placeholder-green-600/50 focus:border-green-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'time_tracking':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="- 09:00-12:00: Feature Development&#10;- 13:00-15:00: Bug Fixes&#10;- 15:30-17:00: Code Review"
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-indigo-600/30 rounded font-mono text-indigo-400 placeholder-indigo-600/50 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'tools_used':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="- VS Code&#10;- Chrome DevTools&#10;- Git&#10;- npm"
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-pink-600/30 rounded font-mono text-pink-400 placeholder-pink-600/50 focus:border-pink-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'reflection':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Today I learned...&#10;I could improve...&#10;Tomorrow I want to..."
              rows={4}
              className="w-full px-3 py-2 bg-transparent border border-violet-600/30 rounded font-mono text-violet-400 placeholder-violet-600/50 focus:border-violet-500 focus:outline-none resize-none"
            />
          </div>
        )

      case 'github_activity':
        return (
          <div className="space-y-2">
            <div className="mb-4">
              <GitHubEvents 
                username={(value as GitHubActivityModuleValue | undefined)?.username || ''} 
                token={(value as GitHubActivityModuleValue | undefined)?.token || ''}
                maxEvents={3}
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-mono text-slate-400 mb-2">
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={(value as GitHubActivityModuleValue | undefined)?.username || ''}
                  onChange={(e) => onChange({ ...(typeof value === 'object' ? value : {}), username: e.target.value } as GitHubActivityModuleValue)}
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
                  value={(value as GitHubActivityModuleValue | undefined)?.token || ''}
                  onChange={(e) => onChange({ ...(typeof value === 'object' ? value : {}), token: e.target.value } as GitHubActivityModuleValue)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-transparent border border-green-600/30 rounded font-mono text-green-400 placeholder-green-600/50 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-slate-400 mb-2">
                  Notes about today&apos;s GitHub activity
                </label>
                <textarea
                  value={(value as GitHubActivityModuleValue | undefined)?.notes || ''}
                  onChange={(e) => onChange({ ...(typeof value === 'object' ? value : {}), notes: e.target.value } as GitHubActivityModuleValue)}
                  placeholder="- Worked on authentication feature&#10;- Fixed critical bug in payment flow&#10;- Reviewed 3 pull requests"
                  rows={3}
                  className="w-full px-3 py-2 bg-transparent border border-green-600/30 rounded font-mono text-green-400 placeholder-green-600/50 focus:border-green-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-slate-400 font-mono text-sm">
            Module type not implemented: {module.type}
          </div>
        )
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-mono text-slate-300">
        {(() => {
          const getModuleIcon = (emoji: string) => {
            const iconMap: { [key: string]: typeof FaBullseye } = {
              goals: FaBullseye,
              achieved: FaCheck,
              problems: FaBug,
              learnings: FaBrain,
              mood: FaChartLine,
              code_snippets: FaCode,
              meetings: FaPhone,
              resources: FaLink,
              next_steps: FaRocket,
              challenges: FaBolt,
              accomplishments: FaTrophy,
              time_tracking: FaClock,
              tools_used: FaTools,
              reflection: FaLightbulb
            }
            return iconMap[emoji] || FaFileAlt
          }
          const Icon = getModuleIcon(module.emoji)
          return <><Icon className="inline mr-1" /> {module.title}</>
        })()}
      </h3>
      {renderModuleContent()}
    </div>
  )
}
