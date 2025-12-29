const nextJest = require('next/jest')
const path = require('path')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './'
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Force rootDir to use posix-style path to avoid Windows escaping issues
  rootDir: path.resolve(__dirname).replace(/\\/g, '/'),
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  setupFiles: ['<rootDir>/jest.polyfills.js'],

  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock static files
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Mock lucide-react ESM module
    '^lucide-react$': '<rootDir>/__mocks__/lucide-react.js'
  },

  // Test patterns - use relative paths to avoid Windows escaping issues
  testMatch: [
    '**/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],

  // Exclude Playwright tests from Jest - use relative paths
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/tests/e2e/',
    '/tests/global-setup.ts',
    '/tests/global-teardown.ts'
  ],

  // Coverage collection
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**',
    '!src/types/**',
    '!src/app/globals.css',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/not-found.tsx',
    '!src/middleware.ts' // Skip middleware due to Next.js specifics
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Higher standards for critical files
    './src/lib/validation.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/lib/db.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/lib/monitoring.ts': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },

  // Coverage reports
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json-summary'],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },

  // Transform ignore patterns - include ESM packages that need transformation
  transformIgnorePatterns: [
    '/node_modules/(?!(node-fetch|lucide-react|@upstash|uncrypto)/)',
    '^.+\\.module\\.(css|sass|scss)$'
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Test timeout for async tests
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Automatically clear mock calls and instances between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Global setup and teardown
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js'
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// Wrap to override next/jest's transformIgnorePatterns for lucide-react
module.exports = async () => {
  const jestConfig = await createJestConfig(customJestConfig)()

  // Override transformIgnorePatterns to allow ESM packages transformation
  jestConfig.transformIgnorePatterns = [
    '/node_modules/(?!(node-fetch|lucide-react|@upstash|uncrypto)/)',
    '^.+\\.module\\.(css|sass|scss)$'
  ]

  return jestConfig
}
