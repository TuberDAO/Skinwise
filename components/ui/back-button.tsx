'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from './button'

interface BackButtonProps {
  fallbackHref?: string
  className?: string
  variant?: 'default' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children?: React.ReactNode
}

export function BackButton({ 
  fallbackHref = '/', 
  className = '',
  variant = 'ghost',
  size = 'sm',
  children 
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Check if there's browser history to go back to
    if (typeof window !== 'undefined' && window.history.length > 1) {
      // Use browser's back functionality for better UX
      window.history.back()
    } else {
      // Fallback to home page if no history
      router.push(fallbackHref)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={`flex items-center space-x-2 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {children || <span>Back</span>}
    </Button>
  )
} 