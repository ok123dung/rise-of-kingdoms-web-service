'use client'

export default function PaymentHistory() {
  const mockHistory = [
    { id: '1', date: '2024-01-15', method: 'MoMo', amount: 500000, status: 'completed' },
    { id: '2', date: '2024-01-10', method: 'VNPay', amount: 1000000, status: 'completed' },
    { id: '3', date: '2024-01-05', method: 'ZaloPay', amount: 750000, status: 'failed' }
  ]

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <h3 className="text-lg font-semibold">Lịch sử thanh toán</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {mockHistory.map(payment => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-100">
                  💳
                </div>
                <div>
                  <div className="font-medium">{payment.method}</div>
                  <div className="text-sm text-gray-500">{payment.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{payment.amount.toLocaleString('vi-VN')} VNĐ</div>
                <div
                  className={`text-sm ${payment.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {payment.status === 'completed' ? 'Thành công' : 'Thất bại'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
