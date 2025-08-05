module.exports = {
  ci: {
    collect: {
      url: [
        'https://rokdbot.com',
        'https://rokdbot.com/services',
        'https://rokdbot.com/guides',
        'https://rokdbot.com/alliance',
        'https://rokdbot.com/contact',
        'https://rokdbot.com/about'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        // Optimize for Vietnamese users
        throttling: {
          rttMs: 150,      // Vietnam average RTT
          throughputKbps: 1600, // 3G connection speed common in Vietnam
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 0,
          downloadThroughputKbps: 1600,
          uploadThroughputKbps: 750
        },
        // Test with Vietnamese locale
        locale: 'vi',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: [
          'unused-javascript', // Skip for now due to Next.js chunks
          'render-blocking-resources' // Skip for now due to fonts
        ]
      }
    },
    assert: {
      assertions: {
        // Performance thresholds optimized for Vietnamese mobile users
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals thresholds
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'first-input-delay': ['warn', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        
        // Mobile-specific metrics
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 5000 }],
        
        // Vietnamese-specific requirements
        'font-display': 'error', // Important for Vietnamese characters
        'unused-css-rules': ['warn', { maxNumericValue: 20000 }],
        'total-byte-weight': ['warn', { maxNumericValue: 1500000 }], // 1.5MB for mobile
        
        // SEO requirements for Vietnamese market
        'document-title': 'error',
        'meta-description': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        
        // Accessibility for Vietnamese users
        'color-contrast': 'error',
        'heading-order': 'error',
        'label': 'error',
        'link-name': 'error'
      }
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: process.env.LHCI_SERVER_URL,
      token: process.env.LHCI_TOKEN
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci.db'
      }
    }
  }
}