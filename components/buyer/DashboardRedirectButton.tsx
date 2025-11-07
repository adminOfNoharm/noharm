'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface DashboardRedirectButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  onClick?: () => void
}

export default function DashboardRedirectButton({ 
  children, 
  className, 
  variant, 
  size,
  onClick 
}: DashboardRedirectButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    router.push('/onboarding/dashboard')
  }

  return (
    <Button
      onClick={handleClick}
      className={className}
      variant={variant}
      size={size}
    >
      {children}
    </Button>
  )
} 