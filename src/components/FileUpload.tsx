'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Image, Film, File, Loader2, CheckCircle } from 'lucide-react'

interface FileUploadProps {
  onUpload: (file: UploadedFile) => void
  onError?: (error: string) => void
  accept?: string
  maxSize?: number
  folder?: string
  isPublic?: boolean
  className?: string
  children?: React.ReactNode
}

interface UploadedFile {
  key: string
  url: string
  size: number
  mimeType: string
  filename: string
}

export function FileUpload({
  onUpload,
  onError,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  folder = 'general',
  isPublic = false,
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
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
      formData.append('isPublic', isPublic.toString())

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      
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
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        <div onClick={() => inputRef.current?.click()}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      
      <div
        onClick={() => inputRef.current?.click()}
        className={`
          relative overflow-hidden rounded-lg border-2 border-dashed p-8
          cursor-pointer transition-all
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <div className="text-center">
              {uploadProgress < 100 ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
                </>
              ) : (
                <>
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-600">Upload complete!</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Upload Icon and Text */}
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            Maximum file size: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>
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
    mimeType: string
    url: string
    createdAt: string
  }>
  onDelete?: (key: string) => void
  loading?: boolean
}

export function FileList({ files, onDelete, loading }: FileListProps) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />
    if (mimeType.startsWith('video/')) return <Film className="h-5 w-5" />
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5" />
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
      <div className="text-center py-8">
        <File className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-sm text-gray-500">No files uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-gray-400">
              {getFileIcon(file.mimeType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.filename}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View
            </a>
            {onDelete && (
              <button
                onClick={() => onDelete(file.key)}
                className="text-red-600 hover:text-red-700"
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