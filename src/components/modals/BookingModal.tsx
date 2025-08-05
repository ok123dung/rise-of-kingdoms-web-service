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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Đặt lịch dịch vụ
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn dịch vụ *
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
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
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">{selectedServiceData.name}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Giá:</span>
                  <span className="ml-2 font-medium">{selectedServiceData.price.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div>
                  <span className="text-blue-600">Thời gian:</span>
                  <span className="ml-2 font-medium">{selectedServiceData.duration}</span>
                </div>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Họ tên *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập họ tên của bạn"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0912345678"
              required
            />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Ngày mong muốn *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Giờ mong muốn *
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Ghi chú thêm
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả chi tiết yêu cầu của bạn, tình trạng tài khoản hiện tại, mục tiêu mong muốn..."
            />
          </div>

          {/* Terms */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Tôi đồng ý với{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                  điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  chính sách bảo mật
                </a>{' '}
                của RoK Services
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}