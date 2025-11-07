'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export function InfiniteMovingCards({
  items,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
}: {
  items: {
    quote: string
    name: string
    title: string
  }[]
  direction?: 'left' | 'right'
  speed?: 'fast' | 'normal' | 'slow'
  pauseOnHover?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  useEffect(() => {
    const baseSpeed = {
      fast: 20,
      normal: 40,
      slow: 60,
    }
    setDuration(baseSpeed[speed] * items.length)
  }, [speed, items])

  return (
    <div
      ref={containerRef}
      className="relative m-auto max-w-7xl overflow-hidden"
    >
      <motion.div
        initial={{ x: direction === 'left' ? 0 : -containerWidth }}
        animate={{ x: direction === 'left' ? -containerWidth : 0 }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex gap-4 py-12"
        style={{
          ...(pauseOnHover && { ['hover' as any]: { animationPlayState: 'paused' } }),
        }}
      >
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="relative flex-shrink-0 rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-sm w-[350px]"
          >
            <p className="text-sm leading-normal text-gray-600">{item.quote}</p>
            <div className="mt-4">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-600">{item.title}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

