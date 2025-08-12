// Service Worker for RoK Services PWA
// Optimized for Vietnamese mobile users

const CACHE_NAME = 'rok-services-v1.0.0'
const RUNTIME_CACHE = 'runtime-cache-v1'

// Critical assets to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/images/logo-192.png',
  '/images/logo-512.png'
]

// API endpoints to cache with stale-while-revalidate
const API_ENDPOINTS = [
  '/api/services',
  '/api/health'
]

// Assets to cache on demand
const ASSET_PATTERNS = [
  /\/_next\/static\/.*/,
  /\/images\/.*/,
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:js|css|woff2|woff)$/
]

self.addEventListener('install', event => {
  console.log('SW: Installing service worker...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching critical assets')
        // Cache assets individually to handle failures gracefully
        return Promise.all(
          CRITICAL_ASSETS.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`SW: Failed to cache ${url}:`, error)
              // Continue with other assets even if one fails
            })
          })
        )
      })
      .then(() => {
        console.log('SW: Critical assets cached')
        return self.skipWaiting() // Force activation
      })
      .catch(error => {
        console.error('SW: Failed to cache critical assets:', error)
        // Still activate even if caching fails
        return self.skipWaiting()
      })
  )
})

self.addEventListener('activate', event => {
  console.log('SW: Activating service worker...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE
            )
            .map(cacheName => {
              console.log('SW: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // Handle different types of requests
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request))
  } else if (isAssetRequest(url)) {
    event.respondWith(handleAssetRequest(request))
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request))
  }
})

// Check if request is for API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || 
         API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))
}

// Check if request is for static asset
function isAssetRequest(url) {
  return ASSET_PATTERNS.some(pattern => pattern.test(url.pathname)) ||
         url.pathname.includes('/_next/static/')
}

// Check if request is for page
function isPageRequest(request) {
  return request.method === 'GET' && 
         request.headers.get('accept')?.includes('text/html')
}

// Handle API requests with stale-while-revalidate
async function handleAPIRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request.clone())
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('SW: API request failed, trying cache:', request.url)
    
    // Fall back to cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline API response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This request is not available offline'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle asset requests with cache-first strategy
async function handleAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  
  // Try cache first
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('SW: Asset request failed:', request.url)
    
    // Return placeholder for images
    if (request.url.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
      return new Response(
        '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280">Image Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      )
    }
    
    throw error
  }
}

// Handle page requests with network-first, fallback to cache
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('SW: Page request failed, trying cache:', request.url)
    
    // Try cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Try to match similar routes
    const url = new URL(request.url)
    const possibleMatches = [
      '/',               // Home page
      '/services',       // Services page
      '/contact',        // Contact page
      '/about'          // About page
    ]
    
    for (const match of possibleMatches) {
      const fallbackResponse = await cache.match(match)
      if (fallbackResponse) {
        return fallbackResponse
      }
    }
    
    // Return offline page
    return await cache.match('/offline') || 
           new Response(getOfflineHTML(), {
             headers: { 'Content-Type': 'text/html' }
           })
  }
}

// Offline HTML template
function getOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - RoK Services</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0; padding: 0; 
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container { 
          text-align: center; 
          padding: 2rem;
          max-width: 500px;
        }
        .icon { 
          font-size: 4rem; 
          margin-bottom: 1rem;
        }
        h1 { 
          font-size: 2rem; 
          margin-bottom: 1rem;
          font-weight: 600;
        }
        p { 
          font-size: 1.1rem; 
          margin-bottom: 2rem;
          opacity: 0.9;
          line-height: 1.6;
        }
        button {
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.3);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        button:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }
        .features {
          margin-top: 2rem;
          text-align: left;
        }
        .feature {
          margin: 0.5rem 0;
          opacity: 0.8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📱</div>
        <h1>Bạn đang offline</h1>
        <p>
          Không có kết nối internet. Một số tính năng có thể không hoạt động, 
          nhưng bạn vẫn có thể xem các trang đã lưu trong bộ nhớ cache.
        </p>
        
        <button onclick="window.location.reload()">
          Thử lại
        </button>
        
        <div class="features">
          <div class="feature">✅ Xem thông tin dịch vụ</div>
          <div class="feature">✅ Xem liên hệ</div>
          <div class="feature">❌ Đặt dịch vụ mới</div>
          <div class="feature">❌ Thanh toán</div>
        </div>
      </div>
      
      <script>
        // Auto retry connection every 30 seconds
        setInterval(() => {
          if (navigator.onLine) {
            window.location.reload()
          }
        }, 30000)
        
        // Listen for online event
        window.addEventListener('online', () => {
          window.location.reload()
        })
      </script>
    </body>
    </html>
  `
}

// Background sync for payment queue
self.addEventListener('sync', event => {
  console.log('SW: Background sync triggered:', event.tag)
  
  if (event.tag === 'payment-queue') {
    event.waitUntil(processPaymentQueue())
  } else if (event.tag === 'booking-queue') {
    event.waitUntil(processBookingQueue())
  }
})

// Process queued payments when back online
async function processPaymentQueue() {
  try {
    // Get queued payments from IndexedDB or localStorage
    const queuedPayments = await getQueuedItems('payments')
    
    for (const payment of queuedPayments) {
      try {
        const response = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payment.data)
        })
        
        if (response.ok) {
          await removeQueuedItem('payments', payment.id)
          console.log('SW: Payment processed successfully:', payment.id)
        }
      } catch (error) {
        console.error('SW: Failed to process payment:', payment.id, error)
      }
    }
  } catch (error) {
    console.error('SW: Error processing payment queue:', error)
  }
}

// Process queued bookings when back online
async function processBookingQueue() {
  try {
    const queuedBookings = await getQueuedItems('bookings')
    
    for (const booking of queuedBookings) {
      try {
        const response = await fetch('/api/bookings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking.data)
        })
        
        if (response.ok) {
          await removeQueuedItem('bookings', booking.id)
          console.log('SW: Booking processed successfully:', booking.id)
        }
      } catch (error) {
        console.error('SW: Failed to process booking:', booking.id, error)
      }
    }
  } catch (error) {
    console.error('SW: Error processing booking queue:', error)
  }
}

// Helper functions for IndexedDB operations
async function getQueuedItems(storeName) {
  // In a real implementation, use IndexedDB
  // For now, return empty array
  return []
}

async function removeQueuedItem(storeName, id) {
  // In a real implementation, remove from IndexedDB
  console.log(`SW: Removing queued item ${id} from ${storeName}`)
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('SW: Push notification received')
  
  const options = {
    body: 'Bạn có thông báo mới từ RoK Services',
    icon: '/images/logo-192.png',
    badge: '/images/badge-96.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Xem ngay',
        icon: '/images/action-open.png'
      },
      {
        action: 'close',
        title: 'Đóng',
        icon: '/images/action-close.png'
      }
    ]
  }
  
  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.data.url = data.url || options.data.url
  }
  
  event.waitUntil(
    self.registration.showNotification('RoK Services', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('SW: Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
})

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  console.log('SW: Periodic sync triggered:', event.tag)
  
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCriticalAssets())
  }
})

// Update critical assets in background
async function updateCriticalAssets() {
  try {
    const cache = await caches.open(CACHE_NAME)
    
    // Update critical pages
    const criticalPages = ['/', '/services', '/contact']
    
    for (const page of criticalPages) {
      try {
        const response = await fetch(page)
        if (response.ok) {
          await cache.put(page, response)
          console.log(`SW: Updated cache for ${page}`)
        }
      } catch (error) {
        console.log(`SW: Failed to update cache for ${page}:`, error)
      }
    }
  } catch (error) {
    console.error('SW: Error updating critical assets:', error)
  }
}

console.log('SW: Service Worker loaded successfully')