'use client'

import { Task } from '@/types/devlog'
import { FaTasks, FaTimes } from 'react-icons/fa'

interface TaskSelectorProps {
  tasks: Task[]
  selectedTaskId?: string
  onSelectTask: (taskId?: string, taskDescription?: string) => void
  disabled?: boolean
}

export default function TaskSelector({
  tasks,
  selectedTaskId,
  onSelectTask,
  disabled = false
}: TaskSelectorProps) {
  const incompleteTasks = tasks.filter(t => !t.completed && t.description.trim())
  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  if (incompleteTasks.length === 0) {
    return (
      <div
        className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
        style={{
          backgroundColor: 'var(--dl-surface)',
          color: 'var(--dl-muted)'
        }}
      >
        <FaTasks size={14} />
        <span>No tasks available</span>
      </div>
    )
  }

  if (selectedTask) {
    return (
      <div
        className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
        style={{
          backgroundColor: 'var(--dl-surface)',
          border: '1px solid var(--dl-border)'
        }}
      >
        <FaTasks size={14} style={{ color: 'var(--dl-accent)' }} />
        <span
          className="flex-1 truncate"
          style={{ color: 'var(--dl-text)' }}
        >
          {selectedTask.description}
        </span>
        {!disabled && (
          <button
            onClick={() => onSelectTask(undefined, undefined)}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: 'var(--dl-muted)' }}
            title="Remove task link"
          >
            <FaTimes size={12} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <select
        value=""
        onChange={(e) => {
          const task = incompleteTasks.find(t => t.id === e.target.value)
          if (task) {
            onSelectTask(task.id, task.description)
          }
        }}
        disabled={disabled}
        className="w-full appearance-none text-sm px-3 py-2 pr-8 rounded-lg cursor-pointer transition-all"
        style={{
          backgroundColor: 'var(--dl-surface)',
          border: '1px solid var(--dl-border)',
          color: 'var(--dl-muted)'
        }}
      >
        <option value="">Link to task (optional)</option>
        {incompleteTasks.map(task => (
          <option key={task.id} value={task.id}>
            {task.description.length > 40
              ? task.description.substring(0, 40) + '...'
              : task.description}
          </option>
        ))}
      </select>
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--dl-muted)' }}
      >
        <FaTasks size={14} />
      </div>
    </div>
  )
}
