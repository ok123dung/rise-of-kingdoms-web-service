// API test setup - no window/DOM mocking needed
require('@testing-library/jest-dom')

// Mock console methods
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
}
