'use client'

import { useState } from 'react'

import { Camera, Loader2, User } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  onUploadComplete?: (url: string) => void
  size?: 'sm' | 'md' | 'lg'
}

export function AvatarUpload({
  currentAvatarUrl,
  onUploadComplete,
  size = 'md'
}: AvatarUploadProps) {
  const { data: session, update } = useSession()
  const [isUploading, setIsUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const [error, setError] = useState<string | null>(null)

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      })

      interface UploadResponse {
        avatarUrl?: string
        error?: string
      }

      if (!response.ok) {
        const data = (await response.json()) as UploadResponse
        throw new Error(data.error ?? 'Upload failed')
      }

      const data = (await response.json()) as UploadResponse
      if (data.avatarUrl) {
        setAvatarUrl(data.avatarUrl)

        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            image: data.avatarUrl
          }
        })

        onUploadComplete?.(data.avatarUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100`}
        >
          {avatarUrl ? (
            <img alt="Avatar" className="h-full w-full object-cover" src={avatarUrl} />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-1/2 w-1/2 text-gray-400" />
            </div>
          )}
        </div>

        <label
          htmlFor="avatar-upload"
          className={`
            absolute bottom-0 right-0 
            flex h-8 w-8 cursor-pointer items-center justify-center 
            rounded-full bg-blue-600 text-white 
            transition-colors hover:bg-blue-700
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </label>

        <input
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          id="avatar-upload"
          type="file"
          onChange={e => void handleFileChange(e)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
