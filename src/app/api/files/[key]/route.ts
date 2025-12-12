import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { getLogger } from '@/lib/monitoring/logger'
import { UploadService } from '@/lib/storage/upload-service'

// Note: params is async in Next.js 16+
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await UploadService.deleteFile(key, session.user.id)

    if (!success) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    getLogger().error('Delete file error', error as Error)

    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
