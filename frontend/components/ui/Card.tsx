import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`
      bg-background-paper rounded-xl border border-slate-100
      shadow-saas transition-all duration-300 ease-out select-text
      ${className}
    `}>
      {children}
    </div>
  )
}
