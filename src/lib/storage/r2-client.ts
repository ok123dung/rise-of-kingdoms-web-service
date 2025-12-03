import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3'

import { getLogger } from '@/lib/monitoring/logger'

// R2 configuration
const { R2_ACCOUNT_ID } = process.env
const { R2_ACCESS_KEY_ID } = process.env
const { R2_SECRET_ACCESS_KEY } = process.env
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'rokservices-files'

// Only show warning in non-build phase to avoid build errors
const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  (process.env.VERCEL && process.env.VERCEL_ENV === undefined)

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  if (!isBuildPhase) {
    getLogger().warn('R2 credentials not configured. File uploads will be disabled.')
  }
}

// Create S3 client configured for R2
const s3Config: S3ClientConfig = {
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: true
}

export const r2Client = new S3Client(s3Config)
export const R2_BUCKET = R2_BUCKET_NAME

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  avatar: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  image: 20 * 1024 * 1024, // 20MB
  video: 100 * 1024 * 1024, // 100MB
  default: 10 * 1024 * 1024 // 10MB
}

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  avatar: ['image/jpeg', 'image/png', 'image/webp'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  screenshot: ['image/jpeg', 'image/png', 'image/webp']
}

// Generate unique file key
export function generateFileKey(
  folder: string,
  userId: string,
  filename: string,
  timestamp = true
): string {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const uniqueId = timestamp ? Date.now() : ''

  return `${folder}/${userId}/${uniqueId ? `${uniqueId}-` : ''}${sanitizedFilename}`
}

// Get public URL for a file
export function getPublicUrl(key: string): string {
  const publicDomain = process.env.R2_PUBLIC_URL || `https://${R2_BUCKET_NAME}.r2.dev`
  return `${publicDomain}/${key}`
}

// Validate file type
export function isValidFileType(
  mimeType: string,
  category: keyof typeof ALLOWED_FILE_TYPES
): boolean {
  return ALLOWED_FILE_TYPES[category]?.includes(mimeType) || false
}

// Validate file size
export function isValidFileSize(size: number, category: keyof typeof FILE_SIZE_LIMITS): boolean {
  const limit = FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.default
  return size <= limit
}
