import { headers } from 'next/headers'

import { NonceProvider } from './NonceProvider'

// Note: headers() is async in Next.js 16+
export async function CSPNonceProvider({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') ?? ''

  return <NonceProvider nonce={nonce}>{children}</NonceProvider>
}
