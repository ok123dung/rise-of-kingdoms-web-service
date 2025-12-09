import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
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
    const folder = (formData.get('folder') as string) || 'images'
    const is_public = formData.get('is_public') === 'true'
    const width = formData.get('width') ? parseInt(formData.get('width') as string, 10) : undefined
    const height = formData.get('height')
      ? parseInt(formData.get('height') as string, 10)
      : undefined
    const quality = formData.get('quality') ? parseInt(formData.get('quality') as string, 10) : 85
    const generateThumbnail = formData.get('generateThumbnail') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate image type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Check file size before processing
    const MAX_IMAGE_SIZE = 20 * 1024 * 1024 // 20MB for images
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'Image size exceeds maximum allowed size (20MB)' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload and process image
    const result = await UploadService.uploadImage(buffer, file.name, {
      folder,
      user_id: session.user.id,
      is_public,
      metadata: {
        uploadedBy: session.user.email
      },
      width,
      height,
      quality,
      generateThumbnail
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Upload failed' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      file: {
        key: result.key,
        url: result.url,
        size: result.size,
        mime_type: result.mime_type
      }
    })
  } catch (error) {
    getLogger().error('Image upload error', error as Error)

    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
