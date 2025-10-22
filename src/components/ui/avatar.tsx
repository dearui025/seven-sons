'use client'

import Image from 'next/image'
import { useState } from 'react'

interface AvatarProps {
  src?: string
  alt: string
  size?: number
  fallback?: string
  className?: string
}

export default function Avatar({ 
  src, 
  alt, 
  size = 40, 
  fallback, 
  className = '' 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  // 判断是否是有效的图片URL
  const isValidImageUrl = src && (
    src.startsWith('http') || 
    src.startsWith('/') || 
    src.startsWith('data:')
  ) && !imageError
  
  // 判断是否是emoji
  const isEmoji = src && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(src)
  
  // 获取fallback文本
  const getFallbackText = () => {
    if (fallback) return fallback
    if (alt) return alt.charAt(0).toUpperCase()
    return '?'
  }
  
  return (
    <div 
      className={`relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {isValidImageUrl ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : isEmoji ? (
        <span className="text-lg" style={{ fontSize: size * 0.5 }}>
          {src}
        </span>
      ) : (
        <span 
          className="font-semibold text-gray-600" 
          style={{ fontSize: size * 0.4 }}
        >
          {getFallbackText()}
        </span>
      )}
    </div>
  )
}