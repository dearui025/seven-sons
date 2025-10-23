import React from 'react'
import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function QuickActionCard({
  icon,
  title,
  description,
  onClick,
  className,
  disabled = false
}: QuickActionCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:scale-105 border border-gray-200",
        "flex flex-col items-center text-center space-y-3",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="text-blue-600 mb-2">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 text-lg">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}

export default QuickActionCard