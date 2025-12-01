import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng nhập - RoK Services',
  description:
    'Đăng nhập vào tài khoản RoK Services để quản lý đơn hàng và theo dõi tiến độ dịch vụ.'
}

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
