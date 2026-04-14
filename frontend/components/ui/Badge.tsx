import React from 'react'
import { LucideIcon } from 'lucide-react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'neutral'
  icon?: LucideIcon
  className?: string
}

export const Badge = ({ children, variant = 'neutral', icon: Icon, className = '' }: BadgeProps) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    neutral: 'bg-slate-50 text-slate-600 border-slate-100',
  }

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
      ${variants[variant]}
      ${className}
    `}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  )
}
