import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { rateLimit, checkSuspiciousActivity } from '@/lib/rate-limit';
import { addSecurityHeaders, validateRequestOrigin, logAudit } from '@/lib/security';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for suspicious activity
  if (checkSuspiciousActivity(request)) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // Validate request origin for API routes
  if (pathname.startsWith('/api') && !validateRequestOrigin(request)) {
    return NextResponse.json(
      { error: 'Invalid origin' },
      { status: 403 }
    );
  }

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) {
    logAudit({
      action: 'rate_limit_exceeded',
      resource: pathname,
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'failure'
    });
    return rateLimitResponse;
  }

  // Get authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'metacontroller-secret-key-change-in-production'
  });

  // Allow public routes
  const publicRoutes = ['/auth/signin', '/auth/error', '/api/auth'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Redirect to signin if not authenticated
  if (!token && pathname !== '/') {
    logAudit({
      action: 'unauthorized_access',
      resource: pathname,
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'failure'
    });
    
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based route protection
  if (token) {
    const userRole = token.role as string || 'viewer';
    const userId = token.id as string;

    // Admin-only routes
    if (pathname.startsWith('/api/machines') && request.method === 'DELETE' && userRole !== 'admin') {
      logAudit({
        userId,
        action: 'unauthorized_delete',
        resource: pathname,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'failure',
        details: `Role: ${userRole}`
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Engineer+ routes (analytics)
    if (pathname.startsWith('/analytics') && 
        !['admin', 'engineer'].includes(userRole)) {
      logAudit({
        userId,
        action: 'insufficient_permissions',
        resource: pathname,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'failure',
        details: `Role: ${userRole}`
      });
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Viewer restrictions (no POST/PUT/DELETE)
    if (userRole === 'viewer' && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
      logAudit({
        userId,
        action: 'readonly_violation',
        resource: pathname,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'failure',
        details: `Method: ${request.method}`
      });
      return NextResponse.json({ error: 'Read-only access' }, { status: 403 });
    }

    // Log successful access
    if (pathname.startsWith('/api')) {
      logAudit({
        userId,
        action: request.method.toLowerCase(),
        resource: pathname,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'success'
      });
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/machines/:path*',
    '/analytics/:path*',
    '/api/machines/:path*',
    '/api/analysis/:path*',
    '/api/inference/:path*'
  ]
};
