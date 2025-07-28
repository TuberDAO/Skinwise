import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory storage for development (use Redis in production)
const requestCounts = new Map<string, RateLimitEntry>()

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  // Payment endpoints - very strict
  'payment': { requests: 3, windowMs: 60000 }, // 3 requests per minute
  'checkout': { requests: 5, windowMs: 300000 }, // 5 requests per 5 minutes
  
  // Email endpoints - prevent spam
  'email': { requests: 2, windowMs: 60000 }, // 2 emails per minute
  'test-email': { requests: 1, windowMs: 300000 }, // 1 test email per 5 minutes
  
  // File upload - reasonable limits
  'upload': { requests: 10, windowMs: 60000 }, // 10 uploads per minute
  
  // General API - standard limits
  'api': { requests: 30, windowMs: 60000 }, // 30 requests per minute
  
  // Authentication - prevent brute force
  'auth': { requests: 5, windowMs: 300000 }, // 5 auth attempts per 5 minutes
  
  // Webhook - higher limit for legitimate traffic
  'webhook': { requests: 100, windowMs: 60000 }, // 100 webhook calls per minute
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Get client identifier from request
 */
function getClientId(req: NextRequest): string {
  // Try to get real IP from various headers (for proxy/load balancer setups)
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfConnectingIp = req.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0]?.trim() || realIp || cfConnectingIp || req.ip || 'unknown'
  
  // For authenticated requests, you could also use user ID
  // const userId = req.headers.get('x-user-id')
  // return userId ? `user:${userId}` : `ip:${ip}`
  
  return `ip:${ip}`
}

/**
 * Clean up expired entries to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of requestCounts.entries()) {
    if (now > entry.resetTime) {
      requestCounts.delete(key)
    }
  }
}

/**
 * Apply rate limiting to a request
 */
export async function rateLimit(
  req: NextRequest, 
  type: RateLimitType = 'api'
): Promise<RateLimitResult> {
  const clientId = getClientId(req)
  const config = RATE_LIMITS[type]
  const now = Date.now()
  const key = `${type}:${clientId}`
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupExpiredEntries()
  }
  
  let entry = requestCounts.get(key)
  
  // Create new entry if doesn't exist or expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    }
  }
  
  // Check if limit exceeded
  if (entry.count >= config.requests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return {
      success: false,
      limit: config.requests,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter
    }
  }
  
  // Increment counter and save
  entry.count++
  requestCounts.set(key, entry)
  
  return {
    success: true,
    limit: config.requests,
    remaining: config.requests - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Middleware helper to add rate limit headers
 */
export function addRateLimitHeaders(
  headers: Headers, 
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())
  
  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString())
  }
}

/**
 * Create a standardized rate limit error response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const headers = new Headers({
    'Content-Type': 'application/json'
  })
  
  addRateLimitHeaders(headers, result)
  
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter
    }),
    { 
      status: 429,
      headers
    }
  )
}

/**
 * Security logging for rate limit violations
 */
export function logRateLimitViolation(
  req: NextRequest,
  type: RateLimitType,
  clientId: string
): void {
  const timestamp = new Date().toISOString()
  const userAgent = req.headers.get('user-agent') || 'unknown'
  const referer = req.headers.get('referer') || 'none'
  
  console.warn(`🚨 RATE LIMIT VIOLATION [${timestamp}]`, {
    type,
    clientId,
    userAgent,
    referer,
    url: req.url,
    method: req.method
  })
  
  // TODO: In production, send to monitoring service (Sentry, DataDog, etc.)
} 