'use client'

import { useState } from 'react'

import Image from 'next/image'

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
      <div className={cn('flex items-center justify-center bg-gray-200', className)}>
        <span className="text-sm text-gray-500">Image not available</span>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
            'bg-[length:200%_100%] bg-no-repeat'
          )}
        />
      )}

      <Image
        alt={alt}
        blurDataURL={blurDataURL}
        fill={fill}
        height={fill ? undefined : height}
        loading={priority ? 'eager' : lazy ? 'lazy' : 'eager'}
        placeholder={placeholder}
        priority={priority}
        quality={quality}
        sizes={generateSizes()}
        src={src}
        width={fill ? undefined : width}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
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
      priority
      alt={alt}
      className={cn('h-full w-full object-cover', className)}
      placeholder="blur"
      quality={90}
      sizes="100vw"
      src={src}
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
      alt={alt}
      className={cn('rounded-lg object-cover', className)}
      height={size}
      quality={75}
      sizes={`${size}px`}
      src={src}
      width={size}
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
      alt={alt}
      className={cn('rounded-full object-cover', className)}
      height={size}
      quality={80}
      sizes={`${size}px`}
      src={src}
      width={size}
      {...props}
    />
  )
}

// Utility function to generate blur data URL
export function generateBlurDataURL(width = 10, height = 10): string {
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
