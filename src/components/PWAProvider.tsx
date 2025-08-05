'use client'

import { useEffect } from 'react'
import { swManager, useServiceWorker } from '@/lib/sw-registration'

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const {
    isInstallAvailable,
    isUpdateAvailable,
    installApp,
    updateApp,
    requestNotificationPermission
  } = useServiceWorker()

  useEffect(() => {
    // Initialize service worker when component mounts
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      console.log('PWA: Initializing service worker...')
      
      // Request notification permission after user interaction
      const requestPermissions = async () => {
        // Wait for user interaction before requesting permissions
        await new Promise(resolve => {
          const handleInteraction = () => {
            document.removeEventListener('click', handleInteraction)
            document.removeEventListener('touchstart', handleInteraction)
            resolve(void 0)
          }
          
          document.addEventListener('click', handleInteraction, { once: true })
          document.addEventListener('touchstart', handleInteraction, { once: true })
          
          // Fallback timeout
          setTimeout(resolve, 5000)
        })
        
        // Request notification permission
        await requestNotificationPermission()
      }
      
      requestPermissions()
    }
    
    // Handle offline/online events
    const handleOnline = () => {
      console.log('PWA: Back online')
      hideOfflineIndicator()
      
      // Process any queued actions
      swManager?.queueOfflineAction('sync', { timestamp: Date.now() })
    }
    
    const handleOffline = () => {
      console.log('PWA: Gone offline')
      showOfflineIndicator()
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check initial online status
    if (!navigator.onLine) {
      showOfflineIndicator()
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [requestNotificationPermission])

  return <>{children}</>
}

function showOfflineIndicator() {
  // Remove existing indicator
  const existing = document.getElementById('offline-indicator')
  if (existing) {
    existing.remove()
  }
  
  // Create offline indicator
  const indicator = document.createElement('div')
  indicator.id = 'offline-indicator'
  indicator.className = 'fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center text-sm z-50 transform -translate-y-full transition-transform duration-300'
  indicator.innerHTML = `
    <div class="flex items-center justify-center space-x-2">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      <span>Không có kết nối internet. Một số tính năng có thể bị hạn chế.</span>
    </div>
  `
  
  document.body.appendChild(indicator)
  
  // Animate in
  setTimeout(() => {
    indicator.style.transform = 'translateY(0)'
  }, 100)
}

function hideOfflineIndicator() {
  const indicator = document.getElementById('offline-indicator')
  if (indicator) {
    indicator.style.transform = 'translateY(-100%)'
    setTimeout(() => {
      indicator.remove()
    }, 300)
  }
}