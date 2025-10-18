/**
 * Centralized Error Handler
 *
 * Features:
 * - Standardized error response format
 * - Environment-aware error details (no leak in production)
 * - Error classification and HTTP status mapping
 * - Integration with logging system
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { ZodError } from 'zod'

// Error types for classification
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE = 'DATABASE_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
}

// Standard error response structure
export interface ErrorResponse {
  error: string
  type: ErrorType
  message: string
  details?: unknown
  timestamp: string
}

// Custom application error class
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

// Predefined error constructors
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorType.VALIDATION, message, 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(ErrorType.AUTHENTICATION, message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(ErrorType.AUTHORIZATION, message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(ErrorType.NOT_FOUND, `${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: unknown) {
    super(ErrorType.DATABASE, message, 500, details)
    this.name = 'DatabaseError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(ErrorType.RATE_LIMIT, message, 429)
    this.name = 'RateLimitError'
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(ErrorType.INTERNAL, message, 500)
    this.name = 'InternalError'
  }
}

/**
 * Convert any error to standardized ErrorResponse
 */
export function toErrorResponse(error: unknown): ErrorResponse {
  const timestamp = new Date().toISOString()
  const isProduction = process.env.NODE_ENV === 'production'

  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      error: error.name,
      type: error.type,
      message: error.message,
      details: isProduction ? undefined : error.details,
      timestamp
    }
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }))

    return {
      error: 'ValidationError',
      type: ErrorType.VALIDATION,
      message: 'Input validation failed',
      details: isProduction ? undefined : formattedErrors,
      timestamp
    }
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      error: error.name || 'Error',
      type: ErrorType.INTERNAL,
      message: isProduction ? 'Internal server error' : error.message,
      details: isProduction ? undefined : error.stack,
      timestamp
    }
  }

  // Handle unknown errors
  return {
    error: 'UnknownError',
    type: ErrorType.INTERNAL,
    message: 'An unexpected error occurred',
    details: isProduction ? undefined : String(error),
    timestamp
  }
}

/**
 * Get HTTP status code from error
 */
export function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode
  }

  if (error instanceof ZodError) {
    return 400
  }

  return 500
}

/**
 * Main error handler for API routes
 * Logs error and returns standardized JSON response
 */
export function handleApiError(
  error: unknown,
  context?: { method?: string; path?: string }
): NextResponse<ErrorResponse> {
  const errorResponse = toErrorResponse(error)
  const statusCode = getStatusCode(error)

  // Log the error with appropriate level
  if (statusCode >= 500) {
    logger.error('API error', error, context)
  } else if (statusCode >= 400) {
    logger.warn('Client error', { ...context, error: errorResponse })
  } else {
    logger.debug('API error handled', { ...context, error: errorResponse })
  }

  return NextResponse.json(errorResponse, { status: statusCode })
}

/**
 * Async wrapper for API route handlers
 * Automatically catches and handles errors
 */
export function withErrorHandler<T>(
  handler: (...args: any[]) => Promise<T>,
  context?: { method?: string; path?: string }
) {
  return async (...args: any[]): Promise<T | NextResponse<ErrorResponse>> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error, context)
    }
  }
}

/**
 * Helper to throw errors with standardized format
 */
export function throwError(
  type: ErrorType,
  message: string,
  statusCode: number = 500,
  details?: unknown
): never {
  throw new AppError(type, message, statusCode, details)
}

/**
 * Assert condition or throw error
 */
export function assertOrThrow(
  condition: boolean,
  errorType: ErrorType,
  message: string,
  statusCode: number = 400
): asserts condition {
  if (!condition) {
    throw new AppError(errorType, message, statusCode)
  }
}
