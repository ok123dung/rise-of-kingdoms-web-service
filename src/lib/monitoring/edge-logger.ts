// Edge-compatible logger for middleware
export interface EdgeLogger {
  info: (message: string, context?: any) => void
  error: (message: string, error?: Error | unknown, context?: any) => void
  warn: (message: string, context?: any) => void
  debug: (message: string, context?: any) => void
}

export function getEdgeLogger(): EdgeLogger {
  const formatMessage = (level: string, message: string, context?: any, error?: any): string => {
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
    info: (message: string, context?: any) => {
      console.log(formatMessage('info', message, context))
    },
    
    error: (message: string, error?: Error | unknown, context?: any) => {
      console.error(formatMessage('error', message, context, error))
    },
    
    warn: (message: string, context?: any) => {
      console.warn(formatMessage('warn', message, context))
    },
    
    debug: (message: string, context?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(formatMessage('debug', message, context))
      }
    }
  }
}