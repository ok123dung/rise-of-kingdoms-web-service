'use client'

export default function RefundManager() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Quản lý hoàn tiền</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Payment ID</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="PAY_123456" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Số tiền hoàn</label>
              <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="100000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Lý do hoàn tiền</label>
            <textarea rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Nhập lý do..."></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            <button className="px-4 py-2 border rounded-lg">Hủy</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg">Xử lý hoàn tiền</button>
          </div>
        </div>
      </div>
    </div>
  )
}