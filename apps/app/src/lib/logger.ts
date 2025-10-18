/**
 * Secure Logging Utility
 *
 * Features:
 * - Environment-based log levels
 * - Automatic sensitive data masking
 * - Structured logging format
 * - Production-safe (no sensitive data leaks)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment: boolean
  private isProduction: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  /**
   * Sanitize sensitive data from context
   */
  private sanitize(data: any): any {
    if (!data) return data

    if (typeof data === 'string') {
      // Mask tokens (JWT, API keys)
      if (data.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
        return '[TOKEN_REDACTED]'
      }

      // Mask emails in production
      if (this.isProduction && data.includes('@')) {
        const [local, domain] = data.split('@')
        return `${local.substring(0, 2)}***@${domain}`
      }

      return data
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item))
    }

    if (typeof data === 'object') {
      const sanitized: any = {}

      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase()

        // Redact sensitive fields
        if (lowerKey.includes('password') ||
            lowerKey.includes('secret') ||
            lowerKey.includes('token') ||
            lowerKey.includes('key') ||
            lowerKey.includes('authorization')) {
          sanitized[key] = '[REDACTED]'
        } else if (lowerKey.includes('email') && this.isProduction) {
          sanitized[key] = this.sanitize(value)
        } else if (lowerKey.includes('user') && lowerKey.includes('id')) {
          // Mask partial user ID in production
          sanitized[key] = this.isProduction && typeof value === 'string'
            ? `${value.substring(0, 8)}***`
            : value
        } else {
          sanitized[key] = this.sanitize(value)
        }
      }

      return sanitized
    }

    return data
  }

  /**
   * Format log message
   */
  private format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const sanitizedContext = context ? this.sanitize(context) : {}

    return JSON.stringify({
      timestamp,
      level,
      message,
      ...sanitizedContext
    })
  }

  /**
   * Debug level - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.format('debug', message, context))
    }
  }

  /**
   * Info level - logged in all environments
   */
  info(message: string, context?: LogContext): void {
    console.log(this.format('info', message, context))
  }

  /**
   * Warning level
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.format('warn', message, context))
  }

  /**
   * Error level
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = { ...context }

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        // Stack trace only in development
        ...(this.isDevelopment && { stack: error.stack })
      }
    }

    console.error(this.format('error', message, errorContext))
  }

  /**
   * Auth-specific logging
   */
  auth = {
    attempt: (context?: LogContext) => {
      this.debug('Authentication attempt', context)
    },

    success: (userId?: string) => {
      this.info('Authentication successful', {
        userId: this.isProduction && userId ? `${userId.substring(0, 8)}***` : userId
      })
    },

    failure: (reason: string, context?: LogContext) => {
      this.warn('Authentication failed', { reason, ...context })
    },

    logout: (userId?: string) => {
      this.info('User logged out', {
        userId: this.isProduction && userId ? `${userId.substring(0, 8)}***` : userId
      })
    }
  }

  /**
   * API-specific logging
   */
  api = {
    request: (method: string, path: string, context?: LogContext) => {
      this.debug('API request', { method, path, ...context })
    },

    response: (method: string, path: string, status: number, duration?: number) => {
      this.debug('API response', { method, path, status, duration })
    },

    error: (method: string, path: string, error: Error | unknown, context?: LogContext) => {
      this.error('API error', error, { method, path, ...context })
    }
  }

  /**
   * Database-specific logging
   */
  db = {
    query: (table: string, operation: string, context?: LogContext) => {
      this.debug('Database query', { table, operation, ...context })
    },

    error: (table: string, operation: string, error: Error | unknown) => {
      this.error('Database error', error, { table, operation })
    }
  }
}

// Singleton instance
export const logger = new Logger()

// Convenience exports
export const logDebug = logger.debug.bind(logger)
export const logInfo = logger.info.bind(logger)
export const logWarn = logger.warn.bind(logger)
export const logError = logger.error.bind(logger)

export default logger
