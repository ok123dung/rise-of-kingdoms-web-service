import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng ký - RoK Services',
  description:
    'Tạo tài khoản RoK Services mới để trải nghiệm dịch vụ game Rise of Kingdoms chuyên nghiệp hàng đầu Việt Nam.'
}

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
