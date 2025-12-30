/**
 * R2 Client Tests
 * Tests for R2 storage utility functions
 */

import {
  FILE_SIZE_LIMITS,
  ALLOWED_FILE_TYPES,
  generateFileKey,
  getPublicUrl,
  isValidFileType,
  isValidFileSize
} from '../r2-client'

describe('R2 Client Utilities', () => {
  describe('FILE_SIZE_LIMITS', () => {
    it('should have correct avatar limit (5MB)', () => {
      expect(FILE_SIZE_LIMITS.avatar).toBe(5 * 1024 * 1024)
    })

    it('should have correct document limit (10MB)', () => {
      expect(FILE_SIZE_LIMITS.document).toBe(10 * 1024 * 1024)
    })

    it('should have correct image limit (20MB)', () => {
      expect(FILE_SIZE_LIMITS.image).toBe(20 * 1024 * 1024)
    })

    it('should have correct video limit (100MB)', () => {
      expect(FILE_SIZE_LIMITS.video).toBe(100 * 1024 * 1024)
    })

    it('should have correct default limit (10MB)', () => {
      expect(FILE_SIZE_LIMITS.default).toBe(10 * 1024 * 1024)
    })
  })

  describe('ALLOWED_FILE_TYPES', () => {
    it('should include correct avatar types', () => {
      expect(ALLOWED_FILE_TYPES.avatar).toContain('image/jpeg')
      expect(ALLOWED_FILE_TYPES.avatar).toContain('image/png')
      expect(ALLOWED_FILE_TYPES.avatar).toContain('image/webp')
    })

    it('should include correct document types', () => {
      expect(ALLOWED_FILE_TYPES.document).toContain('application/pdf')
      expect(ALLOWED_FILE_TYPES.document).toContain('application/msword')
    })

    it('should include correct image types', () => {
      expect(ALLOWED_FILE_TYPES.image).toContain('image/jpeg')
      expect(ALLOWED_FILE_TYPES.image).toContain('image/png')
      expect(ALLOWED_FILE_TYPES.image).toContain('image/gif')
    })

    it('should include correct video types', () => {
      expect(ALLOWED_FILE_TYPES.video).toContain('video/mp4')
      expect(ALLOWED_FILE_TYPES.video).toContain('video/webm')
    })
  })

  describe('generateFileKey', () => {
    it('should generate key with folder and user_id', () => {
      const key = generateFileKey('avatars', 'user-123', 'photo.jpg', false)
      expect(key).toBe('avatars/user-123/photo.jpg')
    })

    it('should include timestamp when enabled', () => {
      const key = generateFileKey('documents', 'user-456', 'file.pdf', true)
      expect(key).toMatch(/^documents\/user-456\/\d+-file\.pdf$/)
    })

    it('should sanitize special characters in filename', () => {
      const key = generateFileKey('uploads', 'user-789', 'my file (1).jpg', false)
      expect(key).toBe('uploads/user-789/my_file__1_.jpg')
    })

    it('should handle filenames with multiple dots', () => {
      const key = generateFileKey('docs', 'user-1', 'report.v2.final.pdf', false)
      expect(key).toBe('docs/user-1/report.v2.final.pdf')
    })

    it('should handle unicode characters', () => {
      const key = generateFileKey('files', 'user-2', 'tài_liệu.pdf', false)
      expect(key).toMatch(/^files\/user-2\/.*\.pdf$/)
    })
  })

  describe('getPublicUrl', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should use R2_PUBLIC_URL when set', () => {
      process.env.R2_PUBLIC_URL = 'https://cdn.example.com'

      // Re-import to get updated env
      jest.resetModules()
      const { getPublicUrl: getUrl } = require('../r2-client')

      const url = getUrl('avatars/user-1/photo.jpg')
      expect(url).toBe('https://cdn.example.com/avatars/user-1/photo.jpg')
    })

    it('should use default r2.dev URL when R2_PUBLIC_URL not set', () => {
      delete process.env.R2_PUBLIC_URL

      const url = getPublicUrl('files/user-1/doc.pdf')
      expect(url).toContain('/files/user-1/doc.pdf')
    })

    it('should handle keys with special characters', () => {
      const url = getPublicUrl('folder/sub-folder/file-name.jpg')
      expect(url).toContain('folder/sub-folder/file-name.jpg')
    })
  })

  describe('isValidFileType', () => {
    it('should accept valid avatar types', () => {
      expect(isValidFileType('image/jpeg', 'avatar')).toBe(true)
      expect(isValidFileType('image/png', 'avatar')).toBe(true)
      expect(isValidFileType('image/webp', 'avatar')).toBe(true)
    })

    it('should reject invalid avatar types', () => {
      expect(isValidFileType('image/gif', 'avatar')).toBe(false)
      expect(isValidFileType('video/mp4', 'avatar')).toBe(false)
      expect(isValidFileType('application/pdf', 'avatar')).toBe(false)
    })

    it('should accept valid document types', () => {
      expect(isValidFileType('application/pdf', 'document')).toBe(true)
      expect(isValidFileType('application/msword', 'document')).toBe(true)
    })

    it('should reject invalid document types', () => {
      expect(isValidFileType('image/jpeg', 'document')).toBe(false)
      expect(isValidFileType('video/mp4', 'document')).toBe(false)
    })

    it('should accept valid image types', () => {
      expect(isValidFileType('image/jpeg', 'image')).toBe(true)
      expect(isValidFileType('image/gif', 'image')).toBe(true)
    })

    it('should accept valid video types', () => {
      expect(isValidFileType('video/mp4', 'video')).toBe(true)
      expect(isValidFileType('video/webm', 'video')).toBe(true)
    })

    it('should accept valid screenshot types', () => {
      expect(isValidFileType('image/png', 'screenshot')).toBe(true)
      expect(isValidFileType('image/jpeg', 'screenshot')).toBe(true)
    })

    it('should handle empty mime type', () => {
      expect(isValidFileType('', 'image')).toBe(false)
    })
  })

  describe('isValidFileSize', () => {
    it('should accept files within avatar limit', () => {
      expect(isValidFileSize(1024, 'avatar')).toBe(true)
      expect(isValidFileSize(5 * 1024 * 1024, 'avatar')).toBe(true)
    })

    it('should reject files exceeding avatar limit', () => {
      expect(isValidFileSize(6 * 1024 * 1024, 'avatar')).toBe(false)
    })

    it('should accept files within document limit', () => {
      expect(isValidFileSize(5 * 1024 * 1024, 'document')).toBe(true)
      expect(isValidFileSize(10 * 1024 * 1024, 'document')).toBe(true)
    })

    it('should reject files exceeding document limit', () => {
      expect(isValidFileSize(11 * 1024 * 1024, 'document')).toBe(false)
    })

    it('should accept files within image limit', () => {
      expect(isValidFileSize(15 * 1024 * 1024, 'image')).toBe(true)
    })

    it('should reject files exceeding image limit', () => {
      expect(isValidFileSize(25 * 1024 * 1024, 'image')).toBe(false)
    })

    it('should accept files within video limit', () => {
      expect(isValidFileSize(50 * 1024 * 1024, 'video')).toBe(true)
    })

    it('should reject files exceeding video limit', () => {
      expect(isValidFileSize(150 * 1024 * 1024, 'video')).toBe(false)
    })

    it('should use default limit for unknown categories', () => {
      expect(isValidFileSize(10 * 1024 * 1024, 'default')).toBe(true)
      expect(isValidFileSize(11 * 1024 * 1024, 'default')).toBe(false)
    })

    it('should handle zero size', () => {
      expect(isValidFileSize(0, 'image')).toBe(true)
    })

    it('should handle exact limit', () => {
      expect(isValidFileSize(FILE_SIZE_LIMITS.avatar, 'avatar')).toBe(true)
    })
  })
})
