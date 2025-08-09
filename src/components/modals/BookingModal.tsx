'use client'

import { useState } from 'react'

import { X, Calendar, Clock, User, MessageSquare } from 'lucide-react'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId?: string
  serviceName?: string
  onBookingSuccess?: (bookingData: any) => void
}

const services = [
  { id: 'coaching', name: 'Coaching 1-1', price: 500000, duration: '2 giờ' },
  { id: 'account-boost', name: 'Tăng cường tài khoản', price: 1000000, duration: '1 tuần' },
  { id: 'kvk-support', name: 'Hỗ trợ KvK', price: 2000000, duration: '1 tháng' },
  { id: 'alliance-management', name: 'Quản lý liên minh', price: 3000000, duration: '1 tháng' }
]

export default function BookingModal({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  onBookingSuccess
}: BookingModalProps) {
  const [selectedService, setSelectedService] = useState(serviceId || '')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const selectedServiceData = services.find(s => s.id === selectedService)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Mock booking creation
      await new Promise(resolve => setTimeout(resolve, 1500))

      const bookingData = {
        id: `BK_${Date.now()}`,
        serviceId: selectedService,
        serviceName: selectedServiceData?.name,
        customerName,
        customerEmail,
        customerPhone,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        notes,
        status: 'confirmed',
        amount: selectedServiceData?.price || 0,
        createdAt: new Date().toISOString()
      }

      onBookingSuccess?.(bookingData)
      onClose()
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Đặt lịch dịch vụ</h3>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Service Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Chọn dịch vụ *</label>
            <select
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
            >
              <option value="">-- Chọn dịch vụ --</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price.toLocaleString('vi-VN')} VNĐ ({service.duration})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Service Info */}
          {selectedServiceData && (
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-900">{selectedServiceData.name}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Giá:</span>
                  <span className="ml-2 font-medium">
                    {selectedServiceData.price.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <div>
                  <span className="text-blue-600">Thời gian:</span>
                  <span className="ml-2 font-medium">{selectedServiceData.duration}</span>
                </div>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <User className="mr-1 inline h-4 w-4" />
                Họ tên *
              </label>
              <input
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập họ tên của bạn"
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email *</label>
              <input
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Số điện thoại *</label>
            <input
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="0912345678"
              type="tel"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
            />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Calendar className="mr-1 inline h-4 w-4" />
                Ngày mong muốn *
              </label>
              <input
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Clock className="mr-1 inline h-4 w-4" />
                Giờ mong muốn *
              </label>
              <select
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                value={selectedTime}
                onChange={e => setSelectedTime(e.target.value)}
              >
                <option value="">-- Chọn giờ --</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="19:00">07:00 PM</option>
                <option value="20:00">08:00 PM</option>
                <option value="21:00">09:00 PM</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <MessageSquare className="mr-1 inline h-4 w-4" />
              Ghi chú thêm
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả chi tiết yêu cầu của bạn, tình trạng tài khoản hiện tại, mục tiêu mong muốn..."
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Terms */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-start space-x-2">
              <input required className="mt-1" id="terms" type="checkbox" />
              <label className="text-sm text-gray-600" htmlFor="terms">
                Tôi đồng ý với{' '}
                <a className="text-blue-600 underline hover:text-blue-800" href="/terms">
                  điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a className="text-blue-600 underline hover:text-blue-800" href="/privacy">
                  chính sách bảo mật
                </a>{' '}
                của RoK Services
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 border-t pt-4">
            <button
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              disabled={isSubmitting}
              type="button"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
