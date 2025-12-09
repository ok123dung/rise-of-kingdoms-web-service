'use client'

import Image from 'next/image'

interface QRCodeGeneratorProps {
  data: string
  size?: number
  title?: string
}

export default function QRCodeGenerator({ data, size = 200, title }: QRCodeGeneratorProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative" style={{ width: size, height: size }}>
        <Image fill alt="QR Code" className="rounded-lg shadow" sizes={`${size}px`} src={qrUrl} />
      </div>
      {title && <p className="text-sm text-gray-600">{title}</p>}
    </div>
  )
}
