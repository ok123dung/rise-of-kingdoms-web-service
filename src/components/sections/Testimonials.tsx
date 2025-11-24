'use client'

import { Star } from 'lucide-react'

const testimonials = [
    {
        id: 1,
        name: 'Lilith Fan',
        role: 'Kingdom 1234',
        content: 'Dịch vụ tuyệt vời! Chuyên gia đã giúp tôi tối ưu hóa chỉ huy và trang bị một cách hiệu quả.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9hlTpnKqZT3TBwHzOvRqfhVld7ZjJqqDm3FImJEdDS-zpfIL-6Pxi04rjJwOmgKme3lkI76s6OgHZrXsmC8lb1QpdRankxfbCQr49eWPV8v-QocGq7XM8pSbJfImitBnG8g07l0ecGXcumrUaXEIu3wrPn-Jmsd0W9poRUkWT5gFmznOmjdUbzHT8YvC-Trc9etALOH7w0LwO92fUQO3dWPt5DANGR4gYbtnttPao7pjWqzg9stIomFsgtWBbRljzpXpOvZP130A'
    },
    {
        id: 2,
        name: 'Guan Yu Main',
        role: 'Kingdom 5678',
        content: 'Nhờ có sự tư vấn, liên minh của chúng tôi đã giành chiến thắng thuyết phục trong KVK vừa qua.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKJEjnPBtrjwxaF-o-s6mmtpM-Q4Z9gyHz5jMj9TCp3DyzJRvGcAeLrLivkrzhDlceoKRvVcXWuDqqC53T3_Oe94hZAK-NEZCDD5xovl2xGLAnYurH57vI7pq8O7wAOBmkZBvZ5tBK0UXl6mRBnfS7IYqc_sCTev0HeTw2fmvUosOtHZOZr3N3zZkYjz3dfYK1O53qupcMkPGVjVDOZcpXTcEdgrS2GCkOHIp_e6kAUWVMVeaZTY9YxD7Sol4vtE27y0HsHrHiQqU'
    },
    {
        id: 3,
        name: 'KVK Conqueror',
        role: 'Kingdom 9999',
        content: 'Rất chuyên nghiệp và tận tâm. Tôi đã học được rất nhiều chiến thuật mới.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL9L0Np7kA2qYlxv4mobIv5WC66DefamoK188nX_PVIVkslVPqf7xfqwC2yryNTJd7irfQbZb8ohOWD7h95kvNzu3QUMmmhxIGI8xWvk9Uz3sEV6L9NIRTD5cPl1RBbFURNiU6z-8TjvhxbNJSicY-jncZzD4W_WRfdvkNUZU8H9ljQE8bmHhZ0ceV4yk98K_vW_32F30EHgB2vnOmHR3RUmc-bUWmguTChUgFjrCp2SRJDqnE6YBd1f7WqS-DHmO-mqJLARQpUVM'
    }
]

export default function Testimonials() {
    return (
        <section className="bg-background-dark py-12 sm:py-20">
            <div className="container-max">
                <h2 className="mb-12 px-4 text-center text-[22px] font-bold leading-tight tracking-tight text-white">
                    Khách hàng nói gì về chúng tôi
                </h2>

                <div className="flex overflow-x-auto pb-8 [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex gap-4 px-4">
                        {testimonials.map((item) => (
                            <div
                                key={item.id}
                                className="glassmorphism flex min-w-[300px] flex-1 flex-col gap-4 rounded-xl p-6"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="h-12 w-12 rounded-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${item.avatar})` }}
                                    />
                                    <div>
                                        <h3 className="text-base font-bold text-white">{item.name}</h3>
                                        <p className="text-xs text-gray-400">{item.role}</p>
                                    </div>
                                </div>
                                <div className="flex text-primary">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-current" />
                                    ))}
                                </div>
                                <p className="text-sm font-normal leading-relaxed text-gray-300">
                                    "{item.content}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
