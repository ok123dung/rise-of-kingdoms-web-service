// Edge-compatible logger for middleware
export interface EdgeLogger {
  info: (message: string, context?: Record<string, unknown>) => void
  error: (message: string, error?: Error, context?: Record<string, unknown>) => void
  warn: (message: string, context?: Record<string, unknown>) => void
  debug: (message: string, context?: Record<string, unknown>) => void
}

export function getEdgeLogger(): EdgeLogger {
  const formatMessage = (
    level: string,
    message: string,
    context?: Record<string, unknown>,
    error?: unknown
  ): string => {
    const timestamp = new Date().toISOString()
    let log = `[${timestamp}] ${level.toUpperCase()}: ${message}`

    if (error) {
      log += ` | Error: ${error instanceof Error ? error.message : String(error)}`
    }

    if (context) {
      log += ` | Context: ${JSON.stringify(context)}`
    }

    return log
  }

  return {
    info: (message: string, context?: Record<string, unknown>) => {
      // eslint-disable-next-line no-console
      console.log(formatMessage('info', message, context))
    },

    error: (message: string, error?: Error, context?: Record<string, unknown>) => {
       
      console.error(formatMessage('error', message, context, error))
    },

    warn: (message: string, context?: Record<string, unknown>) => {
       
      console.warn(formatMessage('warn', message, context))
    },

    debug: (message: string, context?: Record<string, unknown>) => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug(formatMessage('debug', message, context))
      }
    }
  }
}
