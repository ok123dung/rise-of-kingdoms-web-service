import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'

import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

import {
  r2Client,
  R2_BUCKET,
  generateFileKey,
  getPublicUrl,
  isValidFileType,
  isValidFileSize,
  type ALLOWED_FILE_TYPES
} from './r2-client'

export interface UploadOptions {
  folder: string
  user_id: string
  maxSize?: number
  allowedTypes?: string[]
  is_public?: boolean
  metadata?: Record<string, string>
}

export interface UploadResult {
  success: boolean
  key?: string
  url?: string
  size?: number
  mime_type?: string
  error?: string
}

export interface ImageProcessingOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  generateThumbnail?: boolean
}

export class UploadService {
  // Upload file to R2
  static async uploadFile(
    file: Buffer | Uint8Array | Blob,
    filename: string,
    mime_type: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      // Validate file type
      const fileCategory = this.getFileCategory(mime_type)
      if (!isValidFileType(mime_type, fileCategory as 'image' | 'video' | 'avatar' | 'document' | 'screenshot')) {
        return {
          success: false,
          error: 'Invalid file type'
        }
      }

      // Convert Blob to Buffer if needed
      let buffer: Buffer
      if (file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        buffer = Buffer.from(file)
      }

      // Validate file size
      if (!isValidFileSize(buffer.length, fileCategory as 'default' | 'image' | 'video' | 'avatar' | 'document')) {
        return {
          success: false,
          error: 'File size exceeds limit'
        }
      }

      // Generate unique key
      const key = generateFileKey(options.folder, options.user_id, filename)

      // Upload to R2
      const putCommand = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mime_type,
        Metadata: {
          user_id: options.user_id,
          originalName: filename,
          uploadedAt: new Date().toISOString(),
          ...options.metadata
        }
      })

      await r2Client.send(putCommand)

      // Save file record to database
      await prisma.file_uploads.create({
        data: {
          id: crypto.randomUUID(),
          key,
          filename,
          mime_type,
          size: buffer.length,
          user_id: options.user_id,
          folder: options.folder,
          is_public: options.is_public || false,
          metadata: options.metadata || {},
          updated_at: new Date()
        }
      })

      const url = options.is_public ? getPublicUrl(key) : await this.getSignedUrl(key)

      return {
        success: true,
        key,
        url,
        size: buffer.length,
        mime_type
      }
    } catch (error) {
      getLogger().error('File upload error', error as Error)
      return {
        success: false,
        error: 'Failed to upload file'
      }
    }
  }

  // Upload and process image
  static async uploadImage(
    file: Buffer | Uint8Array | Blob,
    filename: string,
    options: UploadOptions & ImageProcessingOptions
  ): Promise<UploadResult> {
    try {
      // Convert to buffer
      let buffer: Buffer
      if (file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        buffer = Buffer.from(file)
      }

      // Process image with Sharp
      let processedImage = sharp(buffer)
      const metadata = await processedImage.metadata()

      // Resize if needed
      if (options.width || options.height) {
        processedImage = processedImage.resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
      }

      // Convert format if specified
      if (options.format) {
        processedImage = processedImage.toFormat(options.format, {
          quality: options.quality || 85
        })
      }

      // Get processed buffer
      const processedBuffer = await processedImage.toBuffer()
      const processedMimeType = options.format
        ? `image/${options.format}`
        : metadata.format
          ? `image/${metadata.format}`
          : 'image/jpeg'

      // Upload main image
      const mainResult = await this.uploadFile(
        processedBuffer,
        filename,
        processedMimeType,
        options
      )

      if (!mainResult.success || !mainResult.key) {
        return mainResult
      }

      // Generate thumbnail if requested
      if (options.generateThumbnail) {
        const thumbnailBuffer = await sharp(buffer)
          .resize(200, 200, { fit: 'cover' })
          .toFormat('webp', { quality: 80 })
          .toBuffer()

        const thumbnail_key = mainResult.key.replace(/\.[^.]+$/, '_thumb.webp')

        await r2Client.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: thumbnail_key,
            Body: thumbnailBuffer,
            ContentType: 'image/webp'
          })
        )

        // Update database with thumbnail key
        await prisma.file_uploads.update({
          where: { key: mainResult.key },
          data: {
            thumbnail_key,
            metadata: {
              thumbnailUrl: getPublicUrl(thumbnail_key)
            }
          }
        })
      }

      return mainResult
    } catch (error) {
      getLogger().error('Image upload error', error as Error)
      return {
        success: false,
        error: 'Failed to process and upload image'
      }
    }
  }

  // Delete file from R2
  static async deleteFile(key: string, user_id: string): Promise<boolean> {
    try {
      // Verify ownership
      const file = await prisma.file_uploads.findFirst({
        where: { key, user_id }
      })

      if (!file) {
        return false
      }

      // Delete from R2
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: key
        })
      )

      // Delete thumbnail if exists
      if (file.thumbnail_key) {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: file.thumbnail_key
          })
        )
      }

      // Delete from database
      await prisma.file_uploads.delete({
        where: { id: file.id }
      })

      return true
    } catch (error) {
      getLogger().error('File deletion error', error as Error)
      return false
    }
  }

  // Get signed URL for private files
  static async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key
      })

      return await getSignedUrl(r2Client, command, { expiresIn })
    } catch (error) {
      getLogger().error('Signed URL generation error', error as Error)
      throw error
    }
  }

  // Get presigned upload URL
  static async getPresignedUploadUrl(
    filename: string,
    folder: string,
    user_id: string,
    mime_type: string,
    expiresIn = 3600
  ): Promise<{ uploadUrl: string; key: string }> {
    try {
      const key = generateFileKey(folder, user_id, filename)

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: mime_type
      })

      const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn })

      return { uploadUrl, key }
    } catch (error) {
      getLogger().error('Presigned upload URL error', error as Error)
      throw error
    }
  }

  // List user files
  static async listUserFiles(user_id: string, folder?: string, limit = 20, offset = 0) {
    try {
      const where = {
        user_id,
        ...(folder && { folder })
      }

      const [files, total] = await Promise.all([
        prisma.file_uploads.findMany({
          where,
          orderBy: { created_at: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.file_uploads.count({ where })
      ])

      // Add signed URLs for private files
      const filesWithUrls = await Promise.all(
        files.map(async file => ({
          ...file,
          url: file.is_public ? getPublicUrl(file.key) : await this.getSignedUrl(file.key),
          thumbnailUrl: file.thumbnail_key ? getPublicUrl(file.thumbnail_key) : null
        }))
      )

      return {
        files: filesWithUrls,
        total,
        hasMore: offset + limit < total
      }
    } catch (error) {
      getLogger().error('List files error', error as Error)
      throw error
    }
  }

  // Get file category based on mime type
  private static getFileCategory(mime_type: string): keyof typeof ALLOWED_FILE_TYPES {
    if (mime_type.startsWith('image/')) return 'image'
    if (mime_type.startsWith('video/')) return 'video'
    if (mime_type.includes('pdf') || mime_type.includes('document')) return 'document'
    return 'document'
  }

  // Check file existence
  static async fileExists(key: string): Promise<boolean> {
    try {
      await r2Client.send(
        new HeadObjectCommand({
          Bucket: R2_BUCKET,
          Key: key
        })
      )
      return true
    } catch {
      return false
    }
  }

  // Copy file
  static async copyFile(
    sourceKey: string,
    destinationKey: string,
    user_id: string
  ): Promise<boolean> {
    try {
      // Copy in R2
      await r2Client.send(
        new CopyObjectCommand({
          Bucket: R2_BUCKET,
          CopySource: `${R2_BUCKET}/${sourceKey}`,
          Key: destinationKey
        })
      )

      // Get source file data
      const sourceFile = await prisma.file_uploads.findFirst({
        where: { key: sourceKey }
      })

      if (sourceFile) {
        // Create new file record
        await prisma.file_uploads.create({
          data: {
          id: crypto.randomUUID(),
          key: destinationKey,
            filename: sourceFile.filename,
            mime_type: sourceFile.mime_type,
            size: sourceFile.size,
            user_id,
            folder: sourceFile.folder,
            is_public: sourceFile.is_public,
            metadata: sourceFile.metadata || undefined,
          updated_at: new Date()
          }
        })
      }

      return true
    } catch (error) {
      getLogger().error('File copy error', error as Error)
      return false
    }
  }
}
