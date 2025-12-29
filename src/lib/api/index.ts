/**
 * API Utilities - Centralized exports
 */

export * from './response'
export * from './errors'
export { withDatabaseConnection } from './db-middleware'
export type { ApiHandler, DatabaseErrorResponse } from './db-middleware'
