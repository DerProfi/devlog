import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = ''
}: ButtonProps) {
  const baseClasses = 'font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
  
  const variantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    ghost: ''
  }
  
  const variantStyles = {
    primary: { background: 'var(--dl-accent)', color: 'white' },
    secondary: { background: 'var(--dl-surface)', border: '1px solid var(--dl-border)', color: 'var(--dl-text)' },
    ghost: { background: 'transparent', color: 'var(--dl-text)' }
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-2 rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      style={variantStyles[variant]}
    >
      {children}
    </button>
  )
}
