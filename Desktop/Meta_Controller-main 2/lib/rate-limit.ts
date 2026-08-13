import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

const defaultConfig: RateLimitConfig = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute
};

// Route-specific rate limits
const routeLimits: Record<string, RateLimitConfig> = {
  '/api/auth': { interval: 60 * 1000, maxRequests: 5 }, // 5 per minute for auth
  '/api/machines': { interval: 60 * 1000, maxRequests: 100 }, // 100 per minute
  '/api/inference': { interval: 60 * 1000, maxRequests: 30 }, // 30 per minute for ML
  '/api/analysis': { interval: 60 * 1000, maxRequests: 20 }, // 20 per minute for heavy analysis
};

function getConfig(pathname: string): RateLimitConfig {
  for (const [route, config] of Object.entries(routeLimits)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }
  return defaultConfig;
}

function getClientIdentifier(request: NextRequest): string {
  // Use IP address or session token as identifier
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  return `${ip}:${userAgent}`;
}

export function rateLimit(request: NextRequest): NextResponse | null {
  const identifier = getClientIdentifier(request);
  const config = getConfig(request.nextUrl.pathname);
  const key = `${identifier}:${request.nextUrl.pathname}`;
  
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.interval
    });
    return null; // Allow request
  }

  if (record.count < config.maxRequests) {
    // Within limit
    record.count++;
    return null; // Allow request
  }

  // Rate limit exceeded
  const resetIn = Math.ceil((record.resetTime - now) / 1000);
  
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
      retryAfter: resetIn
    },
    {
      status: 429,
      headers: {
        'Retry-After': resetIn.toString(),
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': record.resetTime.toString()
      }
    }
  );
}

// IP-based blocking for suspicious activity
const blockedIPs = new Set<string>();
const suspiciousActivity = new Map<string, number>();

export function checkSuspiciousActivity(request: NextRequest): boolean {
  const identifier = getClientIdentifier(request);
  const ip = identifier.split(':')[0];

  if (blockedIPs.has(ip)) {
    return true; // Blocked
  }

  // Track failed attempts
  const attempts = suspiciousActivity.get(ip) || 0;
  if (attempts > 100) { // 100 failed attempts = block
    blockedIPs.add(ip);
    console.warn(`Blocked suspicious IP: ${ip}`);
    return true;
  }

  return false;
}

export function recordFailedAttempt(request: NextRequest): void {
  const identifier = getClientIdentifier(request);
  const ip = identifier.split(':')[0];
  const attempts = suspiciousActivity.get(ip) || 0;
  suspiciousActivity.set(ip, attempts + 1);
}

export function clearFailedAttempts(request: NextRequest): void {
  const identifier = getClientIdentifier(request);
  const ip = identifier.split(':')[0];
  suspiciousActivity.delete(ip);
}
