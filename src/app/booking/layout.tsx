import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đặt lịch dịch vụ - RoK Services',
  description:
    'Đặt lịch dịch vụ Rise of Kingdoms nhanh chóng, an toàn và bảo mật. Chọn gói dịch vụ phù hợp và nâng tầm tài khoản của bạn ngay hôm nay.'
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
