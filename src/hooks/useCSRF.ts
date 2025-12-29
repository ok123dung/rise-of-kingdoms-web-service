import { useEffect, useState } from 'react'

import { getCSRFHeaders } from '@/lib/csrf-protection'

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null)

  useEffect(() => {
    // Get CSRF token from meta tag or cookie
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')

    if (metaToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for client-side token initialization
      setCSRFToken(metaToken)
    } else {
      // Try to get from cookie
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='))
        ?.split('=')[1]

      if (cookieToken) {
         
        setCSRFToken(cookieToken)
      }
    }
  }, [])

  const getHeaders = (): HeadersInit => {
    return csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
  }

  const fetchWithCSRF = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...getCSRFHeaders(),
      ...options.headers
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: 'same-origin'
    })
  }

  return {
    csrfToken,
    getHeaders,
    fetchWithCSRF
  }
}
