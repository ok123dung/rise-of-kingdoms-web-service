/**
 * Upload Service Tests
 * Tests for file upload, image processing, and storage operations
 */

// Mock AWS SDK S3 client - use factory pattern to avoid hoisting issues
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn()
  return {
    PutObjectCommand: jest.fn().mockImplementation(params => ({ ...params, _type: 'PutObjectCommand' })),
    DeleteObjectCommand: jest.fn().mockImplementation(params => ({ ...params, _type: 'DeleteObjectCommand' })),
    GetObjectCommand: jest.fn().mockImplementation(params => ({ ...params, _type: 'GetObjectCommand' })),
    HeadObjectCommand: jest.fn().mockImplementation(params => ({ ...params, _type: 'HeadObjectCommand' })),
    CopyObjectCommand: jest.fn().mockImplementation(params => ({ ...params, _type: 'CopyObjectCommand' })),
    __mockSend: mockSend
  }
})

// Mock s3-request-presigner
jest.mock('@aws-sdk/s3-request-presigner', () => {
  const mockGetSignedUrl = jest.fn()
  return {
    getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
    __mockGetSignedUrl: mockGetSignedUrl
  }
})

// Mock sharp
jest.mock('sharp', () => {
  const mockSharpInstance = {
    metadata: jest.fn(),
    resize: jest.fn().mockReturnThis(),
    toFormat: jest.fn().mockReturnThis(),
    toBuffer: jest.fn()
  }
  const mockSharp = jest.fn(() => mockSharpInstance)
  ;(mockSharp as unknown as { __instance: typeof mockSharpInstance }).__instance = mockSharpInstance
  return mockSharp
})

// Mock Prisma
jest.mock('@/lib/db', () => {
  const mockPrismaFileUploads = {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
  return {
    prisma: {
      file_uploads: mockPrismaFileUploads
    },
    __mockFileUploads: mockPrismaFileUploads
  }
})

// Mock logger
jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  })
}))

// Mock r2-client
jest.mock('../r2-client', () => {
  const mockSend = jest.fn()
  return {
    r2Client: { send: (...args: unknown[]) => mockSend(...args) },
    R2_BUCKET: 'test-bucket',
    generateFileKey: jest.fn((folder: string, user_id: string, filename: string) => `${folder}/${user_id}/${filename}`),
    getPublicUrl: jest.fn((key: string) => `https://cdn.example.com/${key}`),
    isValidFileType: jest.fn(() => true),
    isValidFileSize: jest.fn(() => true),
    ALLOWED_FILE_TYPES: {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      video: ['video/mp4', 'video/webm'],
      document: ['application/pdf'],
      avatar: ['image/jpeg', 'image/png', 'image/webp'],
      screenshot: ['image/png', 'image/jpeg']
    },
    __mockSend: mockSend
  }
})

// Import after mocks
import { UploadService } from '../upload-service'
import { isValidFileType, isValidFileSize } from '../r2-client'

// Get mock references after imports
const { __mockSend: mockSend } = jest.requireMock('../r2-client') as { __mockSend: jest.Mock }
const { __mockGetSignedUrl: mockGetSignedUrl } = jest.requireMock('@aws-sdk/s3-request-presigner') as { __mockGetSignedUrl: jest.Mock }
const mockSharp = jest.requireMock('sharp') as jest.Mock & { __instance: { metadata: jest.Mock; resize: jest.Mock; toFormat: jest.Mock; toBuffer: jest.Mock } }
const mockSharpInstance = mockSharp.__instance
const { __mockFileUploads: mockPrismaFileUploads } = jest.requireMock('@/lib/db') as { __mockFileUploads: { create: jest.Mock; findFirst: jest.Mock; findMany: jest.Mock; count: jest.Mock; update: jest.Mock; delete: jest.Mock } }

describe('UploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock implementations
    mockSend.mockResolvedValue({})
    mockGetSignedUrl.mockResolvedValue('https://signed-url.example.com/file')
    mockSharpInstance.metadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 })
    mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('processed-image'))
    mockPrismaFileUploads.create.mockResolvedValue({ id: 'file-123', key: 'uploads/user-1/test.jpg' })
  })

  describe('uploadFile', () => {
    const defaultOptions = {
      folder: 'uploads',
      user_id: 'user-123',
      is_public: false
    }

    it('should upload file successfully', async () => {
      const buffer = Buffer.from('test file content')

      const result = await UploadService.uploadFile(
        buffer,
        'test.jpg',
        'image/jpeg',
        defaultOptions
      )

      expect(result.success).toBe(true)
      expect(result.key).toBe('uploads/user-123/test.jpg')
      expect(result.size).toBe(buffer.length)
      expect(result.mime_type).toBe('image/jpeg')
      expect(mockSend).toHaveBeenCalled()
      expect(mockPrismaFileUploads.create).toHaveBeenCalled()
    })

    it('should return signed URL for private files', async () => {
      const buffer = Buffer.from('test content')

      const result = await UploadService.uploadFile(
        buffer,
        'private.pdf',
        'application/pdf',
        { ...defaultOptions, is_public: false }
      )

      expect(result.success).toBe(true)
      expect(result.url).toBe('https://signed-url.example.com/file')
    })

    it('should return public URL for public files', async () => {
      const buffer = Buffer.from('test content')

      const result = await UploadService.uploadFile(
        buffer,
        'public.jpg',
        'image/jpeg',
        { ...defaultOptions, is_public: true }
      )

      expect(result.success).toBe(true)
      expect(result.url).toBe('https://cdn.example.com/uploads/user-123/public.jpg')
    })

    it('should handle Blob input', async () => {
      // Create a mock Blob with arrayBuffer method
      const content = 'blob content'
      const mockBlob = {
        arrayBuffer: jest.fn().mockResolvedValue(new TextEncoder().encode(content).buffer),
        size: content.length,
        type: 'image/png'
      }
      // Make it pass instanceof Blob check
      Object.setPrototypeOf(mockBlob, Blob.prototype)

      const result = await UploadService.uploadFile(
        mockBlob as unknown as Blob,
        'blob.png',
        'image/png',
        defaultOptions
      )

      expect(result.success).toBe(true)
    })

    it('should handle Uint8Array input', async () => {
      const uint8 = new Uint8Array([1, 2, 3, 4, 5])

      const result = await UploadService.uploadFile(
        uint8,
        'binary.bin',
        'application/octet-stream',
        defaultOptions
      )

      expect(result.success).toBe(true)
    })

    it('should reject invalid file type', async () => {
      ;(isValidFileType as jest.Mock).mockReturnValueOnce(false)
      const buffer = Buffer.from('test')

      const result = await UploadService.uploadFile(
        buffer,
        'test.exe',
        'application/x-executable',
        defaultOptions
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid file type')
    })

    it('should reject file exceeding size limit', async () => {
      ;(isValidFileType as jest.Mock).mockReturnValueOnce(true)
      ;(isValidFileSize as jest.Mock).mockReturnValueOnce(false)
      const buffer = Buffer.from('x'.repeat(1000))

      const result = await UploadService.uploadFile(
        buffer,
        'large.jpg',
        'image/jpeg',
        defaultOptions
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('File size exceeds limit')
    })

    it('should include custom metadata', async () => {
      const buffer = Buffer.from('test')
      const metadata = { source: 'upload-form', version: '1.0' }

      await UploadService.uploadFile(buffer, 'test.jpg', 'image/jpeg', {
        ...defaultOptions,
        metadata
      })

      expect(mockPrismaFileUploads.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata
          })
        })
      )
    })

    it('should handle R2 upload error', async () => {
      mockSend.mockRejectedValueOnce(new Error('R2 connection failed'))
      const buffer = Buffer.from('test')

      const result = await UploadService.uploadFile(
        buffer,
        'test.jpg',
        'image/jpeg',
        defaultOptions
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to upload file')
    })

    it('should handle database error', async () => {
      mockPrismaFileUploads.create.mockRejectedValueOnce(new Error('DB error'))
      const buffer = Buffer.from('test')

      const result = await UploadService.uploadFile(
        buffer,
        'test.jpg',
        'image/jpeg',
        defaultOptions
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to upload file')
    })
  })

  describe('uploadImage', () => {
    const defaultOptions = {
      folder: 'images',
      user_id: 'user-123'
    }

    it('should process and upload image successfully', async () => {
      const buffer = Buffer.from('fake image data')

      const result = await UploadService.uploadImage(buffer, 'photo.jpg', defaultOptions)

      expect(result.success).toBe(true)
      expect(mockSharp).toHaveBeenCalledWith(buffer)
      expect(mockSharpInstance.metadata).toHaveBeenCalled()
    })

    it('should resize image when dimensions provided', async () => {
      const buffer = Buffer.from('image data')

      await UploadService.uploadImage(buffer, 'photo.jpg', {
        ...defaultOptions,
        width: 800,
        height: 600
      })

      expect(mockSharpInstance.resize).toHaveBeenCalledWith(800, 600, {
        fit: 'inside',
        withoutEnlargement: true
      })
    })

    it('should convert format when specified', async () => {
      const buffer = Buffer.from('image data')

      await UploadService.uploadImage(buffer, 'photo.png', {
        ...defaultOptions,
        format: 'webp',
        quality: 90
      })

      expect(mockSharpInstance.toFormat).toHaveBeenCalledWith('webp', { quality: 90 })
    })

    it('should use default quality when not specified', async () => {
      const buffer = Buffer.from('image data')

      await UploadService.uploadImage(buffer, 'photo.png', {
        ...defaultOptions,
        format: 'jpeg'
      })

      expect(mockSharpInstance.toFormat).toHaveBeenCalledWith('jpeg', { quality: 85 })
    })

    it('should generate thumbnail when requested', async () => {
      const buffer = Buffer.from('image data')
      mockPrismaFileUploads.create.mockResolvedValueOnce({
        id: 'file-123',
        key: 'images/user-123/photo.jpg'
      })

      await UploadService.uploadImage(buffer, 'photo.jpg', {
        ...defaultOptions,
        generateThumbnail: true
      })

      // Should call sharp twice - once for main, once for thumbnail
      expect(mockSharp).toHaveBeenCalledTimes(2)
      // Should update database with thumbnail key
      expect(mockPrismaFileUploads.update).toHaveBeenCalled()
    })

    it('should handle Blob input for images', async () => {
      // Create a mock Blob with arrayBuffer method
      const content = 'image data'
      const mockBlob = {
        arrayBuffer: jest.fn().mockResolvedValue(new TextEncoder().encode(content).buffer),
        size: content.length,
        type: 'image/jpeg'
      }
      Object.setPrototypeOf(mockBlob, Blob.prototype)

      const result = await UploadService.uploadImage(mockBlob as unknown as Blob, 'blob-photo.jpg', defaultOptions)

      expect(result.success).toBe(true)
    })

    it('should handle image processing error', async () => {
      mockSharpInstance.metadata.mockRejectedValueOnce(new Error('Invalid image'))
      const buffer = Buffer.from('invalid')

      const result = await UploadService.uploadImage(buffer, 'bad.jpg', defaultOptions)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to process and upload image')
    })

    it('should handle missing format in metadata', async () => {
      mockSharpInstance.metadata.mockResolvedValueOnce({ width: 100, height: 100 })
      const buffer = Buffer.from('image')

      const result = await UploadService.uploadImage(buffer, 'unknown.img', defaultOptions)

      expect(result.success).toBe(true)
    })
  })

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockPrismaFileUploads.findFirst.mockResolvedValue({
        id: 'file-123',
        key: 'uploads/user-1/file.jpg',
        user_id: 'user-1',
        thumbnail_key: null
      })
      mockPrismaFileUploads.delete.mockResolvedValue({})

      const result = await UploadService.deleteFile('uploads/user-1/file.jpg', 'user-1')

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalled()
      expect(mockPrismaFileUploads.delete).toHaveBeenCalledWith({
        where: { id: 'file-123' }
      })
    })

    it('should delete thumbnail if exists', async () => {
      mockPrismaFileUploads.findFirst.mockResolvedValue({
        id: 'file-123',
        key: 'images/user-1/photo.jpg',
        user_id: 'user-1',
        thumbnail_key: 'images/user-1/photo_thumb.webp'
      })

      await UploadService.deleteFile('images/user-1/photo.jpg', 'user-1')

      // Should call send twice - once for main file, once for thumbnail
      expect(mockSend).toHaveBeenCalledTimes(2)
    })

    it('should return false if file not found', async () => {
      mockPrismaFileUploads.findFirst.mockResolvedValue(null)

      const result = await UploadService.deleteFile('nonexistent.jpg', 'user-1')

      expect(result).toBe(false)
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should return false if user does not own file', async () => {
      mockPrismaFileUploads.findFirst.mockResolvedValue(null) // No match for user_id

      const result = await UploadService.deleteFile('uploads/other-user/file.jpg', 'user-1')

      expect(result).toBe(false)
    })

    it('should handle R2 deletion error', async () => {
      mockPrismaFileUploads.findFirst.mockResolvedValue({
        id: 'file-123',
        key: 'uploads/user-1/file.jpg',
        user_id: 'user-1'
      })
      mockSend.mockRejectedValueOnce(new Error('R2 error'))

      const result = await UploadService.deleteFile('uploads/user-1/file.jpg', 'user-1')

      expect(result).toBe(false)
    })
  })

  describe('getSignedUrl', () => {
    it('should generate signed URL with default expiration', async () => {
      const url = await UploadService.getSignedUrl('uploads/user-1/file.pdf')

      expect(url).toBe('https://signed-url.example.com/file')
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 3600 }
      )
    })

    it('should accept custom expiration time', async () => {
      await UploadService.getSignedUrl('uploads/user-1/file.pdf', 7200)

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 7200 }
      )
    })

    it('should throw error on failure', async () => {
      mockGetSignedUrl.mockRejectedValueOnce(new Error('Signing failed'))

      await expect(UploadService.getSignedUrl('key')).rejects.toThrow('Signing failed')
    })
  })

  describe('getPresignedUploadUrl', () => {
    it('should generate presigned upload URL', async () => {
      const result = await UploadService.getPresignedUploadUrl(
        'upload.jpg',
        'uploads',
        'user-123',
        'image/jpeg'
      )

      expect(result.uploadUrl).toBe('https://signed-url.example.com/file')
      expect(result.key).toBe('uploads/user-123/upload.jpg')
    })

    it('should accept custom expiration', async () => {
      await UploadService.getPresignedUploadUrl(
        'upload.pdf',
        'docs',
        'user-1',
        'application/pdf',
        1800
      )

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 1800 }
      )
    })

    it('should throw error on failure', async () => {
      mockGetSignedUrl.mockRejectedValueOnce(new Error('Presign failed'))

      await expect(
        UploadService.getPresignedUploadUrl('file.jpg', 'uploads', 'user-1', 'image/jpeg')
      ).rejects.toThrow('Presign failed')
    })
  })

  describe('listUserFiles', () => {
    it('should list user files with pagination', async () => {
      mockPrismaFileUploads.findMany.mockResolvedValue([
        { id: '1', key: 'uploads/user-1/file1.jpg', is_public: true, thumbnail_key: null },
        { id: '2', key: 'uploads/user-1/file2.pdf', is_public: false, thumbnail_key: null }
      ])
      mockPrismaFileUploads.count.mockResolvedValue(10)

      const result = await UploadService.listUserFiles('user-1', undefined, 20, 0)

      expect(result.files).toHaveLength(2)
      expect(result.total).toBe(10)
      expect(result.hasMore).toBe(false)
    })

    it('should calculate hasMore correctly', async () => {
      mockPrismaFileUploads.findMany.mockResolvedValue([
        { id: '1', key: 'k1', is_public: true, thumbnail_key: null }
      ])
      mockPrismaFileUploads.count.mockResolvedValue(25)

      const result = await UploadService.listUserFiles('user-1', undefined, 10, 0)

      expect(result.hasMore).toBe(true)
    })

    it('should filter by folder when provided', async () => {
      mockPrismaFileUploads.findMany.mockResolvedValue([])
      mockPrismaFileUploads.count.mockResolvedValue(0)

      await UploadService.listUserFiles('user-1', 'avatars')

      expect(mockPrismaFileUploads.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'user-1', folder: 'avatars' }
        })
      )
    })

    it('should add signed URLs for private files', async () => {
      mockPrismaFileUploads.findMany.mockResolvedValue([
        { id: '1', key: 'private.pdf', is_public: false, thumbnail_key: null }
      ])
      mockPrismaFileUploads.count.mockResolvedValue(1)

      const result = await UploadService.listUserFiles('user-1')

      expect(result.files[0].url).toBe('https://signed-url.example.com/file')
    })

    it('should add public URLs for public files', async () => {
      mockPrismaFileUploads.findMany.mockResolvedValue([
        { id: '1', key: 'public.jpg', is_public: true, thumbnail_key: null }
      ])
      mockPrismaFileUploads.count.mockResolvedValue(1)

      const result = await UploadService.listUserFiles('user-1')

      expect(result.files[0].url).toBe('https://cdn.example.com/public.jpg')
    })

    it('should include thumbnail URLs when available', async () => {
      mockPrismaFileUploads.findMany.mockResolvedValue([
        { id: '1', key: 'photo.jpg', is_public: true, thumbnail_key: 'photo_thumb.webp' }
      ])
      mockPrismaFileUploads.count.mockResolvedValue(1)

      const result = await UploadService.listUserFiles('user-1')

      expect(result.files[0].thumbnailUrl).toBe('https://cdn.example.com/photo_thumb.webp')
    })

    it('should handle database error', async () => {
      mockPrismaFileUploads.findMany.mockRejectedValueOnce(new Error('DB error'))

      await expect(UploadService.listUserFiles('user-1')).rejects.toThrow('DB error')
    })
  })

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      mockSend.mockResolvedValueOnce({}) // HeadObject succeeds

      const exists = await UploadService.fileExists('uploads/user-1/file.jpg')

      expect(exists).toBe(true)
    })

    it('should return false if file does not exist', async () => {
      mockSend.mockRejectedValueOnce(new Error('Not found'))

      const exists = await UploadService.fileExists('nonexistent.jpg')

      expect(exists).toBe(false)
    })
  })

  describe('copyFile', () => {
    it('should copy file successfully', async () => {
      mockPrismaFileUploads.findFirst.mockResolvedValue({
        id: 'src-123',
        filename: 'original.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
        folder: 'uploads',
        is_public: true,
        metadata: { source: 'upload' }
      })
      mockPrismaFileUploads.create.mockResolvedValue({ id: 'dest-123' })

      const result = await UploadService.copyFile(
        'uploads/user-1/original.jpg',
        'uploads/user-2/copy.jpg',
        'user-2'
      )

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalled() // CopyObjectCommand
      expect(mockPrismaFileUploads.create).toHaveBeenCalled()
    })

    it('should create new file record with new user_id', async () => {
      mockPrismaFileUploads.findFirst.mockResolvedValue({
        filename: 'file.pdf',
        mime_type: 'application/pdf',
        size: 2048,
        folder: 'docs',
        is_public: false,
        metadata: {}
      })

      await UploadService.copyFile('source-key', 'dest-key', 'new-user')

      expect(mockPrismaFileUploads.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            key: 'dest-key',
            user_id: 'new-user'
          })
        })
      )
    })

    it('should handle source file not found in database', async () => {
      mockPrismaFileUploads.findFirst.mockResolvedValue(null)

      const result = await UploadService.copyFile('source', 'dest', 'user-1')

      // R2 copy should still succeed
      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalled()
      // But no database record created
      expect(mockPrismaFileUploads.create).not.toHaveBeenCalled()
    })

    it('should handle R2 copy error', async () => {
      mockSend.mockRejectedValueOnce(new Error('Copy failed'))

      const result = await UploadService.copyFile('source', 'dest', 'user-1')

      expect(result).toBe(false)
    })
  })
})
