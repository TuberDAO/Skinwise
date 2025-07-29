import { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Upstash Redis for Vercel serverless
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limit configurations optimized for serverless
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

// Create rate limiters for each endpoint type
const rateLimiters: Record<RateLimitType, Ratelimit> = {
  payment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    analytics: true,
    prefix: 'skinwise:payment',
  }),
  checkout: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '5 m'),
    analytics: true,
    prefix: 'skinwise:checkout',
  }),
  email: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, '1 m'),
    analytics: true,
    prefix: 'skinwise:email',
  }),
  'test-email': new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '5 m'),
    analytics: true,
    prefix: 'skinwise:test-email',
  }),
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'skinwise:upload',
  }),
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'skinwise:api',
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '5 m'),
    analytics: true,
    prefix: 'skinwise:auth',
  }),
  webhook: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'skinwise:webhook',
  }),
}

/**
 * Get client identifier from request (Vercel-optimized)
 */
function getClientId(req: NextRequest): string {
  // Vercel provides IP in different headers
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfIp = req.headers.get('cf-connecting-ip') // Cloudflare
  const vercelIp = req.ip // Vercel's built-in IP

  const ip = forwarded?.split(',')[0] || realIp || cfIp || vercelIp || 'anonymous'
  
  // Clean IP address
  return ip.trim()
}

/**
 * Main rate limiting function using Upstash Redis
 */
export async function rateLimit(req: NextRequest, type: RateLimitType = 'api'): Promise<RateLimitResult> {
  try {
    const clientId = getClientId(req)
    const ratelimiter = rateLimiters[type]
    
    if (!ratelimiter) {
      console.error(`Rate limiter not found for type: ${type}`)
      // Fail open for unknown types
      return {
        success: true,
        limit: 1000,
        remaining: 999,
        resetTime: Date.now() + 60000,
      }
    }

    const { success, limit, remaining, reset } = await ratelimiter.limit(clientId)
    
    const result: RateLimitResult = {
      success,
      limit,
      remaining,
      resetTime: reset,
      retryAfter: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
    }

    // Log rate limit events for monitoring
    if (!success) {
      console.warn(`🚨 Rate limit exceeded for ${type}:`, {
        clientId: clientId.substring(0, 8) + '...',
        type,
        limit,
        remaining,
        resetTime: new Date(reset).toISOString(),
      })
    }

    return result
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open on Redis errors to maintain availability
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      resetTime: Date.now() + 60000,
    }
  }
}

/**
 * Add rate limit headers to response (Vercel-compatible)
 */
export function addRateLimitHeaders(headers: Headers, result: RateLimitResult): void {
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', result.resetTime.toString())
  
  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString())
  }
}

/**
 * Create standardized rate limit response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': '0',
    'X-RateLimit-Reset': result.resetTime.toString(),
  })
  
  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString())
  }

  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
    }),
    { status: 429, headers }
  )
}

/**
 * Log rate limit violations for security monitoring
 */
export function logRateLimitViolation(req: NextRequest, type: RateLimitType, clientId: string): void {
  const logData = {
    event: 'rate_limit_violation',
    type,
    clientId: clientId.substring(0, 8) + '...',
    userAgent: req.headers.get('user-agent'),
    referer: req.headers.get('referer'),
    timestamp: new Date().toISOString(),
    url: req.url,
  }
  
  console.warn('🚨 Rate limit violation:', logData)
  
  // In production, you might want to send this to a monitoring service
  // e.g., Sentry, LogRocket, or Vercel Analytics
} 