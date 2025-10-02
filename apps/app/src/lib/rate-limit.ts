/**
 * Rate Limiting Utility
 *
 * Protects API endpoints from abuse and spam attacks
 * Required for KakaoTalk API integration
 */

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Maximum requests allowed in the interval
}

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
// For production, consider using Redis or Upstash
const rateLimitStore = new Map<string, RateLimitStore>()

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 10 * 60 * 1000)

/**
 * Rate limit configurations by endpoint type
 */
export const RATE_LIMITS = {
  // General API endpoints
  DEFAULT: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 10
  },
  // Authentication endpoints
  AUTH: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 5
  },
  // KakaoTalk API - stricter limits to prevent spam and reduce costs
  KAKAO_TALK: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 5
  },
  // File operations (PDF generation)
  FILE_OPERATIONS: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 20
  }
} as const

/**
 * Rate limiter middleware
 *
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param config - Rate limit configuration
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
} {
  const now = Date.now()
  const key = `${identifier}`

  let store = rateLimitStore.get(key)

  // Initialize or reset if interval has passed
  if (!store || now > store.resetTime) {
    store = {
      count: 0,
      resetTime: now + config.interval
    }
    rateLimitStore.set(key, store)
  }

  // Increment count
  store.count++

  const remaining = Math.max(0, config.maxRequests - store.count)
  const reset = Math.ceil(store.resetTime / 1000) // Convert to seconds

  if (store.count > config.maxRequests) {
    const retryAfter = Math.ceil((store.resetTime - now) / 1000)
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset,
      retryAfter
    }
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    reset
  }
}

/**
 * Create rate limit headers for HTTP responses
 */
export function createRateLimitHeaders(result: ReturnType<typeof rateLimit>) {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString()
  }

  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = result.retryAfter.toString()
  }

  return headers
}

/**
 * Helper function to check rate limit and return error response if exceeded
 *
 * Usage in API routes:
 * ```typescript
 * const rateLimitResult = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
 * if (rateLimitResult) {
 *   return rateLimitResult // Returns NextResponse with 429 status
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): Response | null {
  const result = rateLimit(identifier, config)
  const headers = createRateLimitHeaders(result)

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      }
    )
  }

  return null
}
