'use client'

import { createContext, useContext } from 'react'

interface NonceContextType {
  nonce: string
}

const NonceContext = createContext<NonceContextType | undefined>(undefined)

export function NonceProvider({ 
  children, 
  nonce 
}: { 
  children: React.ReactNode
  nonce: string 
}) {
  return (
    <NonceContext.Provider value={{ nonce }}>
      {children}
    </NonceContext.Provider>
  )
}

export function useNonce() {
  const context = useContext(NonceContext)
  if (!context) {
    throw new Error('useNonce must be used within NonceProvider')
  }
  return context.nonce
}

// Helper component for inline scripts
export function InlineScript({ 
  children,
  ...props 
}: { 
  children: string
  [key: string]: any 
}) {
  const nonce = useNonce()
  return (
    <script 
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: children }}
      {...props}
    />
  )
}

// Helper component for inline styles
export function InlineStyle({ 
  children,
  ...props 
}: { 
  children: string
  [key: string]: any 
}) {
  const nonce = useNonce()
  return (
    <style 
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: children }}
      {...props}
    />
  )
}