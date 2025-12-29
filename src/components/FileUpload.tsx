'use client'

import { useState, useRef, useCallback } from 'react'

import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Film,
  File,
  Loader2,
  CheckCircle
} from 'lucide-react'

interface FileUploadProps {
  onUpload: (file: UploadedFile) => void
  onError?: (error: string) => void
  accept?: string
  maxSize?: number
  folder?: string
  is_public?: boolean
  className?: string
  children?: React.ReactNode
}

interface UploadedFile {
  key: string
  url: string
  size: number
  mime_type: string
  filename: string
}

export function FileUpload({
  onUpload,
  onError,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  folder = 'general',
  is_public = false,
  className = '',
  children
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file size
      if (file.size > maxSize) {
        onError?.(`File size must be less than ${formatFileSize(maxSize)}`)
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)
        formData.append('is_public', is_public.toString())

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string }
          throw new Error(errorData.error ?? 'Upload failed')
        }

        const data = (await response.json()) as { file: UploadedFile }

        onUpload({
          ...data.file,
          filename: file.name
        })

        setUploadProgress(100)

        // Reset after success
        setTimeout(() => {
          setUploadProgress(0)
          if (inputRef.current) {
            inputRef.current.value = ''
          }
        }, 1000)
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Upload failed')
      } finally {
        setIsUploading(false)
      }
    },
    [maxSize, folder, is_public, onUpload, onError]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files?.[0]) {
        void handleFile(e.dataTransfer.files[0])
      }
    },
    [handleFile]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files?.[0]) {
      void handleFile(e.target.files[0])
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (children) {
    return (
      <div className={className}>
        <input
          ref={inputRef}
          accept={accept}
          className="hidden"
          type="file"
          onChange={handleChange}
        />
        <button
          className="w-full text-left"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          {children}
        </button>
      </div>
    )
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Drag handlers for file drop zone, main interaction via input
    <div
      className={`relative ${className}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        accept={accept}
        className="hidden"
        type="file"
        onChange={handleChange}
      />

      <button
        type="button"
        className={`
          relative w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed
          p-8 text-left transition-all
          ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onClick={() => inputRef.current?.click()}
      >
        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <div className="text-center">
              {uploadProgress < 100 ? (
                <>
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
                </>
              ) : (
                <>
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                  <p className="text-sm font-medium text-green-600">Upload complete!</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Upload Icon and Text */}
        <div className="text-center">
          <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="mb-1 text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">Maximum file size: {formatFileSize(maxSize)}</p>
        </div>
      </button>
    </div>
  )
}

// File List Component
interface FileListProps {
  files: Array<{
    id: string
    key: string
    filename: string
    size: number
    mime_type: string
    url: string
    created_at: string
  }>
  onDelete?: (key: string) => void
  loading?: boolean
}

export function FileList({ files, onDelete, loading }: FileListProps) {
  const getFileIcon = (mime_type: string) => {
    if (mime_type.startsWith('image/')) return <ImageIcon className="h-5 w-5" />
    if (mime_type.startsWith('video/')) return <Film className="h-5 w-5" />
    if (mime_type.includes('pdf')) return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="py-8 text-center">
        <File className="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <p className="text-sm text-gray-500">No files uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {files.map(file => (
        <div
          key={file.id}
          className="flex items-center justify-between rounded-lg border bg-white p-3 transition-colors hover:border-gray-300"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="text-gray-400">{getFileIcon(file.mime_type)}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{file.filename}</p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              className="text-sm text-blue-600 hover:text-blue-700"
              href={file.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              View
            </a>
            {onDelete && (
              <button
                className="text-red-600 hover:text-red-700"
                onClick={() => onDelete(file.key)}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
