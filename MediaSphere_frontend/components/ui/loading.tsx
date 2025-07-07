import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  'data-testid'?: string
}

export function LoadingSpinner({ size = 'md', text, 'data-testid': dataTestId }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center" data-testid={dataTestId}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`} />
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  )
}

export function PageLoader({ text = "Loading...", 'data-testid': dataTestId }: { text?: string, 'data-testid'?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid={dataTestId}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}
