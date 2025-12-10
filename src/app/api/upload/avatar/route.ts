import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'
import { UploadService } from '@/lib/storage/upload-service'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate image type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Check file size (5MB max for avatars)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Delete old avatar if exists
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: {
        file_uploads: {
          where: { folder: 'avatars' }
        }
      }
    })

    if (user?.file_uploads && user.file_uploads.length > 0) {
      await Promise.all(
        user.file_uploads.map(oldFile => UploadService.deleteFile(oldFile.key, session.user.id))
      )
    }

    // Upload new avatar
    const result = await UploadService.uploadImage(buffer, `avatar-${Date.now()}.jpg`, {
      folder: 'avatars',
      user_id: session.user.id,
      is_public: true,
      width: 300,
      height: 300,
      quality: 90,
      format: 'jpeg',
      generateThumbnail: true
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Upload failed' }, { status: 400 })
    }

    // Update user avatar URL
    // Note: User model doesn't have 'image' field in current schema
    // Avatar URL is stored in CloudinaryUpload model instead
    // Saved avatar URL to user profile
    await prisma.users.update({
      where: { id: session.user.id },
      data: {
        image: result.url,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      avatarUrl: result.url
    })
  } catch (error) {
    getLogger().error('Avatar upload error', error as Error)

    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
  }
}
