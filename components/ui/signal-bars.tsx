'use client'

interface SignalBarProps {
  height: number
  isActive: boolean
}

const SignalBar = ({ height, isActive }: SignalBarProps) => {
  return (
    <div 
      className={`w-2 rounded-sm transition-colors ${
        isActive ? 'bg-green-500' : 'bg-gray-200'
      }`} 
      style={{ height: `${height}px` }}
    />
  )
}

interface SignalIndicatorProps {
  activeCount: number
  totalBars?: number
}

export default function SignalIndicator({ 
  activeCount, 
  totalBars = 3 
}: SignalIndicatorProps) {
  const generateSignalComponents = (total: number, active: number) => {
    return Array.from({ length: total }, (_, index) => {
      // Calculate height: from 12px to 20px
      const height = 15 + ((30 - 15) / (total - 1)) * index
      
      return (
        <SignalBar 
          key={index}
          height={height}
          isActive={index < active}
        />
      )
    })
  }

  return (
    <div className="flex items-end gap-1">
      {generateSignalComponents(totalBars, activeCount)}
    </div>
  )
}

