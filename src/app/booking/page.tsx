'use client'

import { Suspense, useState, useEffect } from 'react'

import {
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Shield,
  Sparkles,
  Loader2,
  Target
} from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useLanguage } from '@/contexts/LanguageContext'

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    { id: 1, name: t.autoService.title, icon: Shield },
    { id: 2, name: t.common.contact, icon: User },
    { id: 3, name: t.common.bookNow, icon: Check }
  ]

  const [formData, setFormData] = useState({
    service_id: '',
    tierId: '',
    date: '',
    full_name: '',
    email: '',
    phone: '',
    rokId: '',
    kingdom: '',
    notes: ''
  })

  useEffect(() => {
    const serviceParam = searchParams.get('service')
    const tierParam = searchParams.get('tier')

    if (serviceParam) {
      setFormData(prev => ({
        ...prev,
        service_id: serviceParam,
        tierId: tierParam ?? ''
      }))
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

  interface BookingResponse {
    booking_id?: string
    error?: string
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
        const data = (await response.json()) as BookingResponse
        if (data.booking_id) {
          router.push(`/booking/payment/${data.booking_id}`)
        }
      } else {
        // eslint-disable-next-line no-alert
        alert('Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Booking error:', error)
      // eslint-disable-next-line no-alert
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper to get service data from translations
  const getServiceData = (slug: string) => {
    return t.services[slug as keyof typeof t.services]
  }

  interface PricingTier {
    tier: string
    price: number
    features: string[]
  }

  const selectedService = getServiceData(formData.service_id)
  // Find tier by matching slug or name since we don't have explicit slugs in translation pricing
  const selectedTier =
    selectedService?.pricing.find(
      (p: PricingTier) =>
        p.tier.toLowerCase().replace(/\s+/g, '-') === formData.tierId || p.tier === formData.tierId
    ) ?? selectedService?.pricing[0]

  // Icon map
  const iconMap: Record<string, typeof Target> = {
    'auto-gem-farm': Target
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pb-20 pt-10">
        <div className="container-max">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="relative flex justify-between">
              {steps.map((step, _index) => {
                const is_active = currentStep >= step.id
                const _isCurrent = currentStep === step.id

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`
                        flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300
                        ${
                          is_active
                            ? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                            : 'border-gray-300 bg-white text-gray-400'
                        }
                      `}
                    >
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`
                        mt-3 text-sm font-medium transition-colors duration-300
                        ${is_active ? 'text-amber-600' : 'text-gray-500'}
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
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">{t.pricing.title}</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(t.services).map(([slug, service]) => {
                      const IconComponent = iconMap[slug] || Target
                      return (
                        <div
                          key={slug}
                          className={`
                            cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md
                            ${
                              formData.service_id === slug
                                ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                                : 'border-gray-100 hover:border-amber-200'
                            }
                          `}
                          onClick={() => setFormData(prev => ({ ...prev, service_id: slug }))}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`rounded-lg p-2 ${formData.service_id === slug ? 'bg-amber-200' : 'bg-gray-100'}`}
                            >
                              <IconComponent
                                className={`h-6 w-6 ${formData.service_id === slug ? 'text-amber-700' : 'text-gray-500'}`}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{service.name}</h3>
                              <p className="text-sm text-gray-500">
                                {service.pricing[0].price.toLocaleString('vi-VN')} VNĐ
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-fadeIn">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">{t.common.contact}</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t.common.contact} Name
                      </label>
                      <input
                        className="input-field"
                        placeholder="Nguyễn Văn A"
                        type="text"
                        value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-2 block text-sm font-medium text-gray-700"
                        htmlFor="booking-email"
                      >
                        Email
                      </label>
                      <input
                        className="input-field"
                        id="booking-email"
                        placeholder="email@example.com"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-2 block text-sm font-medium text-gray-700"
                        htmlFor="booking-phone"
                      >
                        Phone
                      </label>
                      <input
                        className="input-field"
                        id="booking-phone"
                        placeholder="0912345678"
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-2 block text-sm font-medium text-gray-700"
                        htmlFor="booking-kingdom"
                      >
                        Kingdom ID (Optional)
                      </label>
                      <input
                        className="input-field"
                        id="booking-kingdom"
                        placeholder="#1234"
                        type="text"
                        value={formData.kingdom}
                        onChange={e => setFormData({ ...formData, kingdom: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label
                        className="mb-2 block text-sm font-medium text-gray-700"
                        htmlFor="booking-notes"
                      >
                        Note
                      </label>
                      <textarea
                        className="input-field"
                        id="booking-notes"
                        placeholder="Bạn cần hỗ trợ cụ thể vấn đề gì?"
                        rows={3}
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-fadeIn">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">{t.common.bookNow}</h2>

                  <div className="rounded-xl bg-gray-50 p-6">
                    <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                      <div>
                        <p className="text-sm text-gray-500">{t.autoService.title}</p>
                        <p className="text-lg font-bold text-amber-600">
                          {selectedService?.name || 'Chưa chọn'}
                        </p>
                        {selectedTier && (
                          <p className="text-sm font-medium text-gray-600">
                            {selectedTier.tier} ({selectedTier.duration})
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{t.pricing.title}</p>
                        <p className="text-lg font-bold text-gray-900">
                          {selectedTier?.price.toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{formData.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
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
                    <p>{t.features.time.desc}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                disabled={currentStep === 1}
                className={`
                  flex items-center space-x-2 rounded-xl px-6 py-3 font-medium transition-colors
                  ${
                    currentStep === 1
                      ? 'cursor-not-allowed text-gray-300'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                onClick={handleBack}
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back</span>
              </button>

              {currentStep < 3 ? (
                <button
                  disabled={currentStep === 1 && !formData.service_id}
                  className={`
                    btn-primary flex items-center space-x-2 px-8 py-3
                    ${currentStep === 1 && !formData.service_id ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                  onClick={handleNext}
                >
                  <span>Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  className="btn-primary flex items-center space-x-2 px-8 py-3"
                  disabled={isSubmitting}
                  onClick={() => void handleSubmit()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                  <span>{isSubmitting ? 'Processing...' : t.common.bookNow}</span>
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
