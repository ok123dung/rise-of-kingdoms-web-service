import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Protected routes that require authentication
const protectedRoutes = [
  '/api/bookings',
  '/api/payments/create',
  '/api/users/profile',
  '/dashboard',
  '/admin',
];

// Admin only routes
const adminRoutes = [
  '/api/admin',
  '/admin',
];

// API routes that need rate limiting
const rateLimitedRoutes = [
  '/api/auth',
  '/api/leads',
  '/api/payments',
];

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = {
  '/api/auth': 5,        // 5 login attempts per minute
  '/api/leads': 10,      // 10 lead submissions per minute
  '/api/payments': 20,   // 20 payment requests per minute
  default: 60,           // 60 requests per minute for other routes
};

export async function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    const rateLimitResponse = await applyRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isAdminRoute) {
    try {
      // Get session token
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      if (!token) {
        // No token, redirect to login or return 401 for API
        if (pathname.startsWith('/api')) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }

      // Check admin access
      if (isAdminRoute && token.role !== 'ADMIN') {
        if (pathname.startsWith('/api')) {
          return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Add user info to headers for API routes
      if (pathname.startsWith('/api')) {
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-user-id', token.sub || '');
        requestHeaders.set('x-user-email', token.email || '');
        requestHeaders.set('x-user-role', token.role || 'CUSTOMER');

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

async function applyRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const pathname = req.nextUrl.pathname;
  
  // Find matching rate limit route
  const limitKey = rateLimitedRoutes.find(route => pathname.startsWith(route));
  if (!limitKey) return null;

  const key = `${ip}:${limitKey}`;
  const now = Date.now();
  
  // Get or create rate limit entry
  let rateLimit = rateLimitStore.get(key);
  
  if (!rateLimit || now > rateLimit.resetTime) {
    rateLimit = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  rateLimit.count++;
  rateLimitStore.set(key, rateLimit);

  // Get max requests for this route
  const maxRequests = RATE_LIMIT_MAX_REQUESTS[limitKey as keyof typeof RATE_LIMIT_MAX_REQUESTS] 
    || RATE_LIMIT_MAX_REQUESTS.default;

  // Check if rate limit exceeded
  if (rateLimit.count > maxRequests) {
    return NextResponse.json(
      { 
        error: 'Too many requests', 
        retryAfter: Math.ceil((rateLimit.resetTime - now) / 1000) 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetTime - now) / 1000)),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.resetTime),
        }
      }
    );
  }

  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    const cutoff = now - RATE_LIMIT_WINDOW * 2;
    for (const [k, v] of Array.from(rateLimitStore.entries())) {
      if (v.resetTime < cutoff) {
        rateLimitStore.delete(k);
      }
    }
  }

  return null;
}

// CSRF token validation for state-changing requests
export function validateCSRFToken(req: NextRequest): boolean {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return true;
  }

  const token = req.headers.get('x-csrf-token');
  const sessionToken = req.cookies.get('csrf-token')?.value;

  return token === sessionToken && !!token;
}