import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth'
import { validatePaymentConfig, getPaymentConfigReport } from '@/lib/payments/config-validator'

export async function GET() {
  try {
    const user = await getCurrentUser()

    // Only admins can view payment config status
    if (!user?.staff || (user.staff.role !== 'admin' && user.staff.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const status = validatePaymentConfig()
    const report = getPaymentConfigReport()

    return NextResponse.json({
      success: true,
      status,
      report
    })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to validate payment config' },
      { status: 500 }
    )
  }
}
