'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hỗ trợ khách hàng</h1>
        <p className="mt-1 text-sm text-gray-500">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Liên hệ nhanh</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Hotline</p>
                  <p className="text-sm text-gray-500">0123 456 789</p>
                </div>
              </div>
              <div className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">support@rokdbot.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Discord</p>
                  <p className="text-sm text-gray-500">RoK Services#1234</p>
                </div>
              </div>
              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Thời gian</p>
                  <p className="text-sm text-gray-500">24/7</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Câu hỏi thường gặp</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-rok-gold hover:text-rok-gold-dark">
                  Làm thế nào để thanh toán?
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-rok-gold hover:text-rok-gold-dark">
                  Thời gian xử lý đơn hàng?
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-rok-gold hover:text-rok-gold-dark">
                  Chính sách hoàn tiền?
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-rok-gold hover:text-rok-gold-dark">
                  Bảo mật tài khoản?
                </a>
              </li>
            </ul>
          </div>
        </div>
        {/* Support Form */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Yêu cầu đã được gửi!
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Chúng tôi sẽ phản hồi trong vòng 24 giờ. Vui lòng kiểm tra email của bạn.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rok-gold hover:bg-rok-gold-dark"
              >
                Gửi yêu cầu mới
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Gửi yêu cầu hỗ trợ</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Loại vấn đề
                  </label>
                  <select
                    {...register('category', { required: 'Vui lòng chọn loại vấn đề' })}
                    id="category"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rok-gold focus:border-rok-gold sm:text-sm rounded-md"
                  >
                    <option value="">Chọn loại vấn đề</option>
                    {categories.map((cat) => (
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
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Tiêu đề
                  </label>
                  <input
                    {...register('subject', { required: 'Vui lòng nhập tiêu đề' })}
                    type="text"
                    id="subject"
                    placeholder="Mô tả ngắn gọn vấn đề của bạn"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rok-gold focus:border-rok-gold sm:text-sm"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Nội dung chi tiết
                  </label>
                  <textarea
                    {...register('message', { required: 'Vui lòng nhập nội dung' })}
                    id="message"
                    rows={6}
                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rok-gold focus:border-rok-gold sm:text-sm"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Thông tin liên hệ:</strong>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Email: {session?.user?.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Họ tên: {session?.user?.fullName}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rok-gold hover:bg-rok-gold-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rok-gold disabled:opacity-50 disabled:cursor-not-allowed"
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