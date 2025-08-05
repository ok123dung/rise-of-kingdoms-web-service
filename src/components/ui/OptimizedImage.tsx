'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  lazy?: boolean
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Generate optimized sizes for Vietnamese mobile users
  const generateSizes = () => {
    if (sizes) return sizes
    
    // Default responsive sizes for Vietnamese market (mobile-first)
    return '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
  }

  // Fallback image for errors
  const fallbackSrc = '/images/placeholder.jpg'

  if (hasError && fallbackSrc) {
    return (
      <div className={cn(
        'bg-gray-200 flex items-center justify-center',
        className
      )}>
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div 
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse',
            'bg-[length:200%_100%] bg-no-repeat'
          )}
        />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={generateSizes()}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : lazy ? 'lazy' : 'eager'}
        {...props}
      />
    </div>
  )
}

// Specialized component for hero images
export function HeroImage({ 
  src, 
  alt, 
  className,
  ...props 
}: Omit<OptimizedImageProps, 'priority' | 'sizes'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true}
      sizes="100vw"
      quality={90}
      placeholder="blur"
      className={cn('w-full h-full object-cover', className)}
      {...props}
    />
  )
}

// Specialized component for thumbnails
export function ThumbnailImage({ 
  src, 
  alt, 
  size = 200,
  className,
  ...props 
}: Omit<OptimizedImageProps, 'width' | 'height' | 'sizes'> & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      sizes={`${size}px`}
      quality={75}
      className={cn('rounded-lg object-cover', className)}
      {...props}
    />
  )
}

// Specialized component for avatars
export function AvatarImage({ 
  src, 
  alt = 'Avatar', 
  size = 40,
  className,
  ...props 
}: Omit<OptimizedImageProps, 'width' | 'height' | 'sizes'> & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      sizes={`${size}px`}
      quality={80}
      className={cn('rounded-full object-cover', className)}
      {...props}
    />
  )
}

// Utility function to generate blur data URL
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Create a simple gradient blur
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f3f4f6')
    gradient.addColorStop(1, '#e5e7eb')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL()
}