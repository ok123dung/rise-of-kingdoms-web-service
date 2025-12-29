// Jest polyfills for browser APIs

// TextEncoder/TextDecoder polyfill (CommonJS for Jest)
const { TextEncoder, TextDecoder } = require('util')

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Fetch polyfill (if needed)
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('')
    })
  )
}

// Performance API polyfill
global.performance = {
  now: jest.fn(() => Date.now()),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  mark: jest.fn(),
  measure: jest.fn()
}

// IntersectionObserver polyfill
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// ResizeObserver polyfill
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// matchMedia polyfill - only if window exists
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  })
}

// scrollTo polyfill
global.scrollTo = jest.fn()

// localStorage/sessionStorage polyfill
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock
global.sessionStorage = localStorageMock

// URL polyfill
global.URL = global.URL || require('url').URL

// Request/Response polyfills for Next.js API routes
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init.method || 'GET'
      this.headers = new Map(Object.entries(init.headers || {}))
      this._body = init.body
    }
    json() {
      return Promise.resolve(JSON.parse(this._body || '{}'))
    }
  }
}

if (typeof global.Response === 'undefined' || typeof global.Response.json !== 'function') {
  class ResponsePolyfill {
    constructor(body, init = {}) {
      this._body = body
      this.status = init.status || 200
      this.statusText = init.statusText || ''
      this.ok = this.status >= 200 && this.status < 300
      this.headers = new Map(Object.entries(init.headers || {}))
    }
    json() {
      return Promise.resolve(typeof this._body === 'string' ? JSON.parse(this._body) : this._body)
    }
    text() {
      return Promise.resolve(typeof this._body === 'string' ? this._body : JSON.stringify(this._body))
    }
    // Static json method required by Next.js NextResponse.json()
    static json(data, init = {}) {
      const body = JSON.stringify(data)
      const headers = {
        'content-type': 'application/json',
        ...(init.headers || {})
      }
      return new ResponsePolyfill(body, {
        ...init,
        headers
      })
    }
  }
  global.Response = ResponsePolyfill
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers extends Map {
    constructor(init = {}) {
      super(Object.entries(init))
    }
  }
}
