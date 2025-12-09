'use client'

import { clientLogger } from './client-logger'

// Service Worker registration utilities
// Optimized for Vietnamese mobile users

export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }

  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  }
}

class ServiceWorkerManager {
  private static instance: ServiceWorkerManager
  private registration: ServiceWorkerRegistration | null = null
  private installPrompt: BeforeInstallPromptEvent | null = null
  private updateAvailable = false

  private constructor() {
    void this.initializeServiceWorker()
    this.setupInstallPrompt()
    this.setupUpdateNotifications()
  }

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager()
    }
    return ServiceWorkerManager.instance
  }

  private async initializeServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      clientLogger.info('SW: Service Worker not supported')
      return
    }

    try {
      clientLogger.info('SW: Registering service worker...')

      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      clientLogger.info('SW: Service Worker registered successfully')

      // Handle registration updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing
        if (newWorker) {
          clientLogger.debug('SW: New service worker installing...')

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true
              this.notifyUpdateAvailable()
            }
          })
        }
      })

      // Check for updates periodically
      setInterval(() => {
        void this.registration?.update()
      }, 60000) // Check every minute
    } catch (error) {
      clientLogger.error('SW: Service Worker registration failed:', error)
    }
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', event => {
      clientLogger.info('SW: Install prompt available')
      event.preventDefault()
      this.installPrompt = event

      // Show custom install button
      this.showInstallButton()
    })

    // Track successful installs
    window.addEventListener('appinstalled', () => {
      clientLogger.info('SW: App installed successfully')
      this.installPrompt = null
      this.hideInstallButton()

      // Track in analytics
      this.trackEvent('pwa_installed', {
        platform: this.getPlatform(),
        timestamp: new Date().toISOString()
      })
    })
  }

  private setupUpdateNotifications() {
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      clientLogger.info('SW: New service worker activated')

      // Show update notification
      this.showUpdateNotification()
    })
  }

  // Public methods
  async installApp(): Promise<boolean> {
    if (!this.installPrompt) {
      clientLogger.debug('SW: Install prompt not available')
      return false
    }

    try {
      clientLogger.debug('SW: Showing install prompt')
      await this.installPrompt.prompt()

      const choice = await this.installPrompt.userChoice
      clientLogger.info('SW: User choice:', choice.outcome)

      if (choice.outcome === 'accepted') {
        this.trackEvent('pwa_install_accepted')
        return true
      } else {
        this.trackEvent('pwa_install_dismissed')
        return false
      }
    } catch (error) {
      clientLogger.error('SW: Install prompt error:', error)
      return false
    }
  }

  isInstallAvailable(): boolean {
    return this.installPrompt !== null
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable
  }

  updateApp(): void {
    if (!this.registration || !this.updateAvailable) {
      return
    }

    const waitingWorker = this.registration.waiting
    if (waitingWorker) {
      clientLogger.info('SW: Activating new service worker')
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })

      // Reload page to use new version
      window.location.reload()
    }
  }

  async queueOfflineAction(action: string, data: Record<string, unknown>): Promise<void> {
    try {
      // In a real implementation, use IndexedDB
      const queuedActions = JSON.parse(localStorage.getItem('offline_queue') || '[]') as Array<{
        id: string
        action: string
        data: unknown
        timestamp: string
      }>

      queuedActions.push({
        id: Date.now().toString(),
        action,
        data,
        timestamp: new Date().toISOString()
      })

      localStorage.setItem('offline_queue', JSON.stringify(queuedActions))

      // Register for background sync when back online
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        try {
          const registration = await navigator.serviceWorker.ready
          if ('sync' in registration) {
            const regWithSync = registration as ServiceWorkerRegistration & {
              sync: { register: (tag: string) => Promise<void> }
            }
            await regWithSync.sync.register(`${action}-queue`)
          }
        } catch (error) {
          clientLogger.warn('Background sync not supported:', error)
        }
      }

      clientLogger.debug(`SW: Queued offline action: ${action}`)
    } catch (error) {
      clientLogger.error('SW: Error queuing offline action:', error)
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      clientLogger.info('SW: Notifications not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      clientLogger.info('SW: Notification permission:', permission)

      if (permission === 'granted') {
        this.trackEvent('notification_permission_granted')
        return true
      } else {
        this.trackEvent('notification_permission_denied')
        return false
      }
    } catch (error) {
      clientLogger.error('SW: Error requesting notification permission:', error)
      return false
    }
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) {
      clientLogger.debug('SW: No service worker registration')
      return null
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      clientLogger.info('SW: Push subscription created')

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)

      return subscription
    } catch (error) {
      clientLogger.error('SW: Error subscribing to push notifications:', error)
      return null
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription,
          platform: this.getPlatform(),
          user_agent: navigator.userAgent
        })
      })
    } catch (error) {
      clientLogger.error('SW: Error sending subscription to server:', error)
    }
  }

  private showInstallButton() {
    // Create or show install button
    let installButton = document.getElementById('pwa-install-button')

    if (!installButton) {
      installButton = document.createElement('button')
      installButton.id = 'pwa-install-button'
      installButton.className =
        'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 hover:bg-blue-700 transition-colors'
      installButton.innerHTML = '📱 Cài đặt App'
      installButton.onclick = () => this.installApp()

      document.body.appendChild(installButton)
    }

    installButton.style.display = 'block'
  }

  private hideInstallButton() {
    const installButton = document.getElementById('pwa-install-button')
    if (installButton) {
      installButton.style.display = 'none'
    }
  }

  private notifyUpdateAvailable() {
    // Show update notification
    const notification = document.createElement('div')
    notification.className =
      'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm'
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-medium">Cập nhật mới có sẵn!</p>
          <p class="text-sm opacity-90">Nhấn để cập nhật ứng dụng.</p>
        </div>
        <button onclick="window.swManager.updateApp()" class="bg-white text-green-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100">
          Cập nhật
        </button>
      </div>
    `

    document.body.appendChild(notification)

    // Auto-hide after 10 seconds
    setTimeout(() => {
      notification.remove()
    }, 10000)
  }

  private showUpdateNotification() {
    // Show simple success message
    const notification = document.createElement('div')
    notification.className =
      'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50'
    notification.innerHTML = '✅ Ứng dụng đã được cập nhật!'

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  private getPlatform(): string {
    const user_agent = navigator.userAgent.toLowerCase()

    if (/android/.test(user_agent)) return 'android'
    if (/iphone|ipad/.test(user_agent)) return 'ios'
    if (/windows/.test(user_agent)) return 'windows'
    if (/mac/.test(user_agent)) return 'mac'

    return 'unknown'
  }

  private trackEvent(event: string, data?: Record<string, unknown>) {
    // Track PWA events for analytics
    clientLogger.debug('SW: Event tracked:', event, data)

    // In a real implementation, send to analytics service
    const windowWithGtag = window as Window & { gtag?: (a: string, b: string, c: object) => void }
    if (typeof window !== 'undefined' && windowWithGtag.gtag) {
      windowWithGtag.gtag('event', event, {
        event_category: 'PWA',
        ...data
      })
    }
  }
}

// Initialize and export singleton
export const swManager = typeof window !== 'undefined' ? ServiceWorkerManager.getInstance() : null

// Make available globally for easy access
if (typeof window !== 'undefined') {
  ;(window as unknown as { swManager: ServiceWorkerManager | null }).swManager = swManager
}

// Hook into React for easy usage in components
export function useServiceWorker() {
  return {
    isInstallAvailable: () => swManager?.isInstallAvailable() ?? false,
    isUpdateAvailable: () => swManager?.isUpdateAvailable() ?? false,
    installApp: () => swManager?.installApp() ?? Promise.resolve(false),
    updateApp: () => swManager?.updateApp(),
    queueOfflineAction: (action: string, data: Record<string, unknown>) =>
      swManager?.queueOfflineAction(action, data) ?? Promise.resolve(),
    requestNotificationPermission: () =>
      swManager?.requestNotificationPermission() ?? Promise.resolve(false),
    subscribeToPushNotifications: () =>
      swManager?.subscribeToPushNotifications() ?? Promise.resolve(null)
  }
}

export default swManager
