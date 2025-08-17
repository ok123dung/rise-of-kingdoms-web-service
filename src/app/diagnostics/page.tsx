'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [navigationTest, setNavigationTest] = useState<string>('')

  useEffect(() => {
    // Collect diagnostic information
    const runDiagnostics = async () => {
      const diag: any = {
        userAgent: navigator.userAgent,
        onLine: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language,
        platform: navigator.platform,
        serviceWorker: 'serviceWorker' in navigator,
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
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
            installing: reg.installing?.state,
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
        protocol: window.location.protocol,
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

    runDiagnostics()
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
      for (let registration of registrations) {
        await registration.unregister()
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        for (let cacheName of cacheNames) {
          await caches.delete(cacheName)
        }
      }
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Navigation Diagnostics</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Navigation Tests</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Test Links (using Next.js Link):</h3>
              <div className="space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
                  Home
                </Link>
                <Link href="/services" className="text-blue-600 hover:text-blue-800 underline">
                  Services
                </Link>
                <Link href="/about" className="text-blue-600 hover:text-blue-800 underline">
                  About
                </Link>
                <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Test with regular anchor tags:</h3>
              <div className="space-x-4">
                <a href="/" className="text-green-600 hover:text-green-800 underline">
                  Home (a tag)
                </a>
                <a href="/services" className="text-green-600 hover:text-green-800 underline">
                  Services (a tag)
                </a>
                <a href="/about" className="text-green-600 hover:text-green-800 underline">
                  About (a tag)
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Test Fetch:</h3>
              <div className="space-x-2">
                <button
                  onClick={() => testNavigation('/services')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Test /services
                </button>
                <button
                  onClick={() => testNavigation('/api/health')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Test /api/health
                </button>
              </div>
              {navigationTest && <p className="mt-2 text-sm">{navigationTest}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Browser Diagnostics</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <button
            onClick={clearServiceWorker}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Service Worker & Caches
          </button>
          <p className="text-sm text-gray-600 mt-2">
            This will unregister all service workers and clear all caches, then reload the page.
          </p>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>If navigation is not working:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
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