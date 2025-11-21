'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Calendar,
    Check,
    ChevronRight,
    ChevronLeft,
    CreditCard,
    User,
    Shield,
    Clock,
    Sparkles,
    Loader2
} from 'lucide-react'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { servicesData } from '@/data/services'

const steps = [
    { id: 1, name: 'Chọn dịch vụ', icon: Shield },
    { id: 2, name: 'Thông tin', icon: User },
    { id: 3, name: 'Xác nhận', icon: Check }
]

function BookingContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        serviceId: '',
        tierId: '',
        date: '',
        fullName: '',
        email: '',
        phone: '',
        rokId: '',
        kingdom: '',
        notes: ''
    })

    useEffect(() => {
        const serviceParam = searchParams.get('service')
        if (serviceParam) {
            setFormData(prev => ({ ...prev, serviceId: serviceParam }))
        }
    }, [searchParams])

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const data = await response.json()
                router.push(`/booking/payment/${data.bookingId}`)
            } else {
                alert('Có lỗi xảy ra. Vui lòng thử lại.')
            }
        } catch (error) {
            console.error('Booking error:', error)
            alert('Có lỗi xảy ra. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedService = Object.values(servicesData).find(s => s.slug === formData.serviceId)

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pb-20 pt-10">
                <div className="container-max">
                    {/* Progress Steps */}
                    <div className="mb-12">
                        <div className="relative flex justify-between">
                            {steps.map((step, index) => {
                                const isActive = currentStep >= step.id
                                const isCurrent = currentStep === step.id

                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                                        <div
                                            className={`
                        flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300
                        ${isActive
                                                    ? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                                    : 'border-gray-300 bg-white text-gray-400'}
                      `}
                                        >
                                            <step.icon className="h-6 w-6" />
                                        </div>
                                        <span
                                            className={`
                        mt-3 text-sm font-medium transition-colors duration-300
                        ${isActive ? 'text-amber-600' : 'text-gray-500'}
                      `}
                                        >
                                            {step.name}
                                        </span>
                                    </div>
                                )
                            })}

                            {/* Progress Bar Background */}
                            <div className="absolute top-6 -z-0 h-0.5 w-full bg-gray-200">
                                <div
                                    className="h-full bg-amber-500 transition-all duration-500 ease-in-out"
                                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mx-auto max-w-4xl">
                        <div className="card min-h-[500px] p-8">
                            {currentStep === 1 && (
                                <div className="animate-fadeIn">
                                    <h2 className="mb-6 text-2xl font-bold text-gray-900">Chọn gói dịch vụ</h2>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {Object.values(servicesData).map((service) => (
                                            <div
                                                key={service.slug}
                                                onClick={() => setFormData(prev => ({ ...prev, serviceId: service.slug }))}
                                                className={`
                          cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md
                          ${formData.serviceId === service.slug
                                                        ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                                                        : 'border-gray-100 hover:border-amber-200'}
                        `}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`rounded-lg p-2 ${formData.serviceId === service.slug ? 'bg-amber-200' : 'bg-gray-100'}`}>
                                                        <service.icon className={`h-6 w-6 ${formData.serviceId === service.slug ? 'text-amber-700' : 'text-gray-500'}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                                        <p className="text-sm text-gray-500">{service.pricing[0].price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="animate-fadeIn">
                                    <h2 className="mb-6 text-2xl font-bold text-gray-900">Thông tin của bạn</h2>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Họ và tên</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.fullName}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                placeholder="Nguyễn Văn A"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                className="input-field"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Số điện thoại</label>
                                            <input
                                                type="tel"
                                                className="input-field"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="0912345678"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Kingdom ID (Optional)</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.kingdom}
                                                onChange={e => setFormData({ ...formData, kingdom: e.target.value })}
                                                placeholder="#1234"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Ghi chú thêm</label>
                                            <textarea
                                                className="input-field"
                                                rows={3}
                                                value={formData.notes}
                                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                placeholder="Bạn cần hỗ trợ cụ thể vấn đề gì?"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="animate-fadeIn">
                                    <h2 className="mb-6 text-2xl font-bold text-gray-900">Xác nhận thông tin</h2>

                                    <div className="rounded-xl bg-gray-50 p-6">
                                        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Dịch vụ đã chọn</p>
                                                <p className="text-lg font-bold text-amber-600">{selectedService?.name || 'Chưa chọn'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Giá dự kiến</p>
                                                <p className="text-lg font-bold text-gray-900">{selectedService?.pricing[0].price}</p>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Họ tên:</span>
                                                <span className="font-medium">{formData.fullName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Email:</span>
                                                <span className="font-medium">{formData.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">SĐT:</span>
                                                <span className="font-medium">{formData.phone}</span>
                                            </div>
                                            {formData.kingdom && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Kingdom:</span>
                                                    <span className="font-medium">{formData.kingdom}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-start space-x-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                                        <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                        <p>
                                            Sau khi gửi yêu cầu, đội ngũ tư vấn sẽ liên hệ với bạn qua Zalo/Discord trong vòng 30 phút để xác nhận và hướng dẫn thanh toán.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex justify-between">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className={`
                  flex items-center space-x-2 rounded-xl px-6 py-3 font-medium transition-colors
                  ${currentStep === 1
                                        ? 'cursor-not-allowed text-gray-300'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
                            >
                                <ChevronLeft className="h-5 w-5" />
                                <span>Quay lại</span>
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={currentStep === 1 && !formData.serviceId}
                                    className={`
                    btn-primary flex items-center space-x-2 px-8 py-3
                    ${(currentStep === 1 && !formData.serviceId) ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                                >
                                    <span>Tiếp tục</span>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="btn-primary flex items-center space-x-2 px-8 py-3"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Check className="h-5 w-5" />
                                    )}
                                    <span>{isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default function BookingPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <BookingContent />
        </Suspense>
    )
}
