'use client'

// Client-side logger that respects production environment
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logLevel: LogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN

  debug(...args: any[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.log(...args)
    }
  }

  info(...args: any[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(...args)
    }
  }

  warn(...args: any[]): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(...args)
    }
  }

  error(...args: any[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(...args)
    }
  }
}

export const clientLogger = new ClientLogger()
