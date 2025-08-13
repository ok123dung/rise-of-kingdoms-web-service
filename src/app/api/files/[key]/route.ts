import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UploadService } from '@/lib/storage/upload-service'
import { getLogger } from '@/lib/monitoring/logger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const success = await UploadService.deleteFile(
      params.key,
      session.user.id
    )

    if (!success) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    getLogger().error('Delete file error', error as Error)
    
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}