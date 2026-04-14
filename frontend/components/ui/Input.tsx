import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2
          text-sm ring-offset-background file:border-0 file:bg-transparent
          file:text-sm file:font-medium placeholder:text-slate-400
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
