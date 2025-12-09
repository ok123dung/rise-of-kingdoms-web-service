import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { getLogger } from '@/lib/monitoring/logger'
import { UploadService } from '@/lib/storage/upload-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const folder = searchParams.get('folder') ?? undefined
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    const result = await UploadService.listUserFiles(session.user.id, folder, limit, offset)

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    getLogger().error('List files error', error as Error)

    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}
