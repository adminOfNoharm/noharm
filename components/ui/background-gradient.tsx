'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

export const BackgroundGradient = ({
  children,
  className = '',
  containerClassName = '',
  animate = true
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  animate?: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setPosition({ x, y })
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container || !animate) return

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [animate])

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', containerClassName)}
    >
      <div className={cn('relative z-10', className)}>{children}</div>
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          opacity,
          transition: 'opacity 0.3s'
        }}
        className="absolute inset-0 pointer-events-none"
      >
        <div 
          className="absolute inset-0 blur-[100px] opacity-50"
          style={{
            background: 'linear-gradient(90deg, #2CD3C1 0%, #4169E1 50%, #6B4DE6 100%)'
          }}
        />
      </div>
    </div>
  )
}

