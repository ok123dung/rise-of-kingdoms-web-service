'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

interface DiagnosticInfo {
  user_agent: string
  onLine: boolean
  cookieEnabled: boolean
  language: string
  platform: string
  serviceWorker: boolean
  localStorage: boolean
  sessionStorage: boolean
  serviceWorkerRegistrations?: number
  serviceWorkerDetails?: Array<{
    scope: string
    active?: string
    waiting?: string
    installing?: string
  }>
  serviceWorkerError?: string
  caches?: string[]
  cacheError?: string
  location?: {
    href: string
    pathname: string
    hostname: string
    port: string
    protocol: string
  }
  consoleErrors?: string[]
}

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null)
  const [navigationTest, setNavigationTest] = useState<string>('')

  useEffect(() => {
    // Collect diagnostic information
    const runDiagnostics = async () => {
      const diag: DiagnosticInfo = {
        user_agent: navigator.userAgent,
        onLine: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language,
        platform: navigator.platform,
        serviceWorker: 'serviceWorker' in navigator,
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined'
      }

      // Check service worker
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          diag.serviceWorkerRegistrations = registrations.length
          diag.serviceWorkerDetails = registrations.map(reg => ({
            scope: reg.scope,
            active: reg.active?.state,
            waiting: reg.waiting?.state,
            installing: reg.installing?.state
          }))
        } catch (e) {
          diag.serviceWorkerError = (e as Error).message
        }
      }

      // Check caches
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys()
          diag.caches = cacheNames
        } catch (e) {
          diag.cacheError = (e as Error).message
        }
      }

      // Check window location
      diag.location = {
        href: window.location.href,
        pathname: window.location.pathname,
        hostname: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol
      }

      // Check for console errors
      const originalError = console.error
      const errors: string[] = []
      console.error = (...args) => {
        errors.push(args.join(' '))
        originalError.apply(console, args)
      }
      diag.consoleErrors = errors

      setDiagnostics(diag)
    }

    void runDiagnostics()
  }, [])

  const testNavigation = async (url: string) => {
    setNavigationTest(`Testing navigation to ${url}...`)
    try {
      const response = await fetch(url)
      const text = await response.text()
      setNavigationTest(`Success! Status: ${response.status}, Content length: ${text.length}`)
    } catch (e) {
      setNavigationTest(`Error: ${(e as Error).message}`)
    }
  }

  const clearServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName)
        }
      }
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Navigation Diagnostics</h1>

        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Navigation Tests</h2>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium">Test Links (using Next.js Link):</h3>
              <div className="space-x-4">
                <Link className="text-blue-600 underline hover:text-blue-800" href="/">
                  Home
                </Link>
                <Link className="text-blue-600 underline hover:text-blue-800" href="/services">
                  Services
                </Link>
                <Link className="text-blue-600 underline hover:text-blue-800" href="/about">
                  About
                </Link>
                <Link className="text-blue-600 underline hover:text-blue-800" href="/contact">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Test with regular anchor tags:</h3>
              <div className="space-x-4">
                <a className="text-green-600 underline hover:text-green-800" href="/">
                  Home (a tag)
                </a>
                <a className="text-green-600 underline hover:text-green-800" href="/services">
                  Services (a tag)
                </a>
                <a className="text-green-600 underline hover:text-green-800" href="/about">
                  About (a tag)
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Test Fetch:</h3>
              <div className="space-x-2">
                <button
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  onClick={() => void testNavigation('/services')}
                >
                  Test /services
                </button>
                <button
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  onClick={() => void testNavigation('/api/health')}
                >
                  Test /api/health
                </button>
              </div>
              {navigationTest && <p className="mt-2 text-sm">{navigationTest}</p>}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Browser Diagnostics</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Actions</h2>
          <button
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            onClick={() => void clearServiceWorker()}
          >
            Clear Service Worker & Caches
          </button>
          <p className="mt-2 text-sm text-gray-600">
            This will unregister all service workers and clear all caches, then reload the page.
          </p>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>If navigation is not working:</p>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Try clicking the "Clear Service Worker & Caches" button</li>
            <li>Open DevTools (F12) and check the Console for errors</li>
            <li>In DevTools, go to Application → Service Workers and unregister any workers</li>
            <li>In DevTools, go to Application → Storage and click "Clear site data"</li>
            <li>Try accessing the site in an incognito/private window</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
