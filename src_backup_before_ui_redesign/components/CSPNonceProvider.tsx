import { headers } from 'next/headers'

import { NonceProvider } from './NonceProvider'

export async function CSPNonceProvider({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const nonce = headersList.get('x-nonce') || ''

  return <NonceProvider nonce={nonce}>{children}</NonceProvider>
}
