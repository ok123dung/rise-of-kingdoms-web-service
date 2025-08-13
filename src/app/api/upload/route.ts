import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UploadService } from '@/lib/storage/upload-service'
import { getLogger } from '@/lib/monitoring/logger'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for file uploads

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'
    const isPublic = formData.get('isPublic') === 'true'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file size before processing
    const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB absolute max
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed size (50MB)' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Upload file
    const result = await UploadService.uploadFile(
      buffer,
      file.name,
      file.type,
      {
        folder,
        userId: session.user.id,
        isPublic,
        metadata: {
          uploadedBy: session.user.email
        }
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      file: {
        key: result.key,
        url: result.url,
        size: result.size,
        mimeType: result.mimeType
      }
    })
  } catch (error) {
    getLogger().error('File upload error', error as Error)
    
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// Get presigned upload URL
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const filename = searchParams.get('filename')
    const folder = searchParams.get('folder') || 'general'
    const mimeType = searchParams.get('mimeType') || 'application/octet-stream'
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      )
    }

    const { uploadUrl, key } = await UploadService.getPresignedUploadUrl(
      filename,
      folder,
      session.user.id,
      mimeType
    )

    return NextResponse.json({
      success: true,
      uploadUrl,
      key
    })
  } catch (error) {
    getLogger().error('Presigned URL error', error as Error)
    
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}