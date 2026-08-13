'use client'

import { DevLogModule } from '@/types/devlog'
import { FaBox, FaBullseye, FaCheck, FaChartLine, FaBug, FaBrain, FaCode, FaPhone, FaLink, FaClock, FaTools, FaFileAlt, FaLightbulb } from 'react-icons/fa'

interface ModuleSelectorProps {
  availableModules: DevLogModule[]
  selectedModules: DevLogModule[]
  onModuleToggle: (module: DevLogModule) => void
}

export default function ModuleSelector({ 
  availableModules, 
  selectedModules, 
  onModuleToggle 
}: ModuleSelectorProps) {
  const requiredModules = availableModules.filter(m => m.required)
  const optionalModules = availableModules.filter(m => !m.required)

  const isSelected = (moduleId: string) => {
    return selectedModules.some(m => m.id === moduleId)
  }

  return (
    <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <h3 className="text-lg font-mono text-slate-300 mb-4 flex items-center gap-2"><FaBox /> Module Configuration</h3>
      
      <div className="space-y-4">
        {/* Required Modules */}
        <div>
          <h4 className="text-sm font-mono text-slate-400 mb-2">Required Modules</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {requiredModules.map((module) => (
              <div
                key={module.id}
                className="flex items-center space-x-2 p-2 bg-slate-700/50 rounded cursor-pointer hover:bg-slate-600/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected(module.id)}
                  onChange={() => onModuleToggle(module)}
                  disabled={true} // Required modules can't be unchecked
                  className="w-4 h-4 text-cyan-500 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                />
                {(() => {
                  const iconMap: { [key: string]: typeof FaBullseye } = {
                    goals: FaBullseye,
                    achieved: FaCheck,
                    mood: FaChartLine,
                    problems: FaBug,
                    learnings: FaBrain,
                    code_snippets: FaCode,
                    meetings: FaPhone,
                    resources: FaLink,
                    time_tracking: FaClock,
                    tools_used: FaTools
                  }
                  const Icon = iconMap[module.emoji] || FaFileAlt
                  return <Icon className="text-sm" />
                })()}
                <span className="text-xs text-slate-300 truncate">{module.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Modules */}
        <div>
          <h4 className="text-sm font-mono text-slate-400 mb-2">Optional Modules</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {optionalModules.map((module) => (
              <div
                key={module.id}
                className="flex items-center space-x-2 p-2 bg-slate-700/50 rounded cursor-pointer hover:bg-slate-600/50 transition-colors"
                onClick={() => onModuleToggle(module)}
              >
                <input
                  type="checkbox"
                  checked={isSelected(module.id)}
                  onChange={() => onModuleToggle(module)}
                  className="w-4 h-4 text-cyan-500 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                />
                {(() => {
                  const iconMap: { [key: string]: typeof FaBullseye } = {
                    goals: FaBullseye,
                    achieved: FaCheck,
                    mood: FaChartLine,
                    problems: FaBug,
                    learnings: FaBrain,
                    code_snippets: FaCode,
                    meetings: FaPhone,
                    resources: FaLink,
                    time_tracking: FaClock,
                    tools_used: FaTools
                  }
                  const Icon = iconMap[module.emoji] || FaFileAlt
                  return <Icon className="text-sm" />
                })()}
                <span className="text-xs text-slate-300 truncate">{module.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          <FaLightbulb className="inline mr-1" /> Tip: Customize your dev log by selecting the modules that matter most to you
        </div>
      </div>
    </div>
  )
}
