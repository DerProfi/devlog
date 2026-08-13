import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  title?: string
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div 
      className={`
        bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6
        ${hover ? 'hover:border-slate-700 hover:bg-slate-900/70 transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
