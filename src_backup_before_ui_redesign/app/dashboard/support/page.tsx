'use client'
import { useState } from 'react'

import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'

interface SupportForm {
  subject: string
  category: string
  message: string
}
const categories = [
  { value: 'payment', label: 'Vấn đề thanh toán' },
  { value: 'service', label: 'Vấn đề dịch vụ' },
  { value: 'account', label: 'Vấn đề tài khoản' },
  { value: 'technical', label: 'Lỗi kỹ thuật' },
  { value: 'other', label: 'Khác' }
]
export default function SupportPage() {
  const { data: session } = useSession()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SupportForm>()
  const onSubmit = async (data: SupportForm) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitted(true)
      reset()
    } catch (error) {
      console.error('Error submitting support request:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hỗ trợ khách hàng</h1>
        <p className="mt-1 text-sm text-gray-500">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Liên hệ nhanh</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <PhoneIcon className="mt-0.5 h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Hotline</p>
                  <p className="text-sm text-gray-500">0123 456 789</p>
                </div>
              </div>
              <div className="flex items-start">
                <EnvelopeIcon className="mt-0.5 h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">support@rokdbot.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <ChatBubbleLeftRightIcon className="mt-0.5 h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Discord</p>
                  <p className="text-sm text-gray-500">RoK Services#1234</p>
                </div>
              </div>
              <div className="flex items-start">
                <ClockIcon className="mt-0.5 h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Thời gian</p>
                  <p className="text-sm text-gray-500">24/7</p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-3 text-sm font-medium text-gray-900">Câu hỏi thường gặp</h3>
            <ul className="space-y-2">
              <li>
                <a className="text-rok-gold hover:text-rok-gold-dark text-sm" href="#">
                  Làm thế nào để thanh toán?
                </a>
              </li>
              <li>
                <a className="text-rok-gold hover:text-rok-gold-dark text-sm" href="#">
                  Thời gian xử lý đơn hàng?
                </a>
              </li>
              <li>
                <a className="text-rok-gold hover:text-rok-gold-dark text-sm" href="#">
                  Chính sách hoàn tiền?
                </a>
              </li>
              <li>
                <a className="text-rok-gold hover:text-rok-gold-dark text-sm" href="#">
                  Bảo mật tài khoản?
                </a>
              </li>
            </ul>
          </div>
        </div>
        {/* Support Form */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Yêu cầu đã được gửi!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Chúng tôi sẽ phản hồi trong vòng 24 giờ. Vui lòng kiểm tra email của bạn.
              </p>
              <button
                className="bg-rok-gold hover:bg-rok-gold-dark mt-6 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white"
                onClick={() => setSubmitted(false)}
              >
                Gửi yêu cầu mới
              </button>
            </div>
          ) : (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Gửi yêu cầu hỗ trợ</h2>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="category">
                    Loại vấn đề
                  </label>
                  <select
                    {...register('category', { required: 'Vui lòng chọn loại vấn đề' })}
                    className="focus:ring-rok-gold focus:border-rok-gold mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm"
                    id="category"
                  >
                    <option value="">Chọn loại vấn đề</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="subject">
                    Tiêu đề
                  </label>
                  <input
                    {...register('subject', { required: 'Vui lòng nhập tiêu đề' })}
                    className="focus:ring-rok-gold focus:border-rok-gold mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
                    id="subject"
                    placeholder="Mô tả ngắn gọn vấn đề của bạn"
                    type="text"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="message">
                    Nội dung chi tiết
                  </label>
                  <textarea
                    {...register('message', { required: 'Vui lòng nhập nội dung' })}
                    className="focus:ring-rok-gold focus:border-rok-gold mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
                    id="message"
                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                    rows={6}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Thông tin liên hệ:</strong>
                  </p>
                  <p className="mt-1 text-sm text-gray-600">Email: {session?.user?.email}</p>
                  <p className="text-sm text-gray-600">Họ tên: {session?.user?.name}</p>
                </div>
                <div className="flex justify-end">
                  <button
                    className="bg-rok-gold hover:bg-rok-gold-dark focus:ring-rok-gold inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
