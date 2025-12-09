import { loadEnvironment } from './env-loader'

// Initialize environment on module load
if (typeof window === 'undefined') {
  // Server-side initialization
  loadEnvironment()
}

// Re-export validated environment
export { env } from './env-validation'
