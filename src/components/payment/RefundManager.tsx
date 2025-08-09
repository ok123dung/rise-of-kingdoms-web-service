'use client'

export default function RefundManager() {
  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <h3 className="text-lg font-semibold">Quản lý hoàn tiền</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Payment ID</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="PAY_123456"
                type="text"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Số tiền hoàn</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="100000"
                type="number"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Lý do hoàn tiền</label>
            <textarea
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Nhập lý do..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button className="rounded-lg border px-4 py-2">Hủy</button>
            <button className="rounded-lg bg-red-600 px-4 py-2 text-white">Xử lý hoàn tiền</button>
          </div>
        </div>
      </div>
    </div>
  )
}
