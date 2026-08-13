import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // HTTPS enforcement
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none';"
  );
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

// CSRF Token Generation and Validation
const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 hour
  
  csrfTokens.set(sessionId, { token, expires });
  
  // Cleanup expired tokens
  for (const [id, data] of csrfTokens.entries()) {
    if (Date.now() > data.expires) {
      csrfTokens.delete(id);
    }
  }
  
  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

// Input Sanitization
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
}

// SQL Injection Prevention (for MongoDB)
export function sanitizeMongoQuery(query: any): any {
  if (typeof query !== 'object' || query === null) {
    return query;
  }

  const sanitized: any = {};
  
  for (const key in query) {
    // Prevent MongoDB operator injection
    if (key.startsWith('$')) {
      console.warn(`Blocked MongoDB operator in query: ${key}`);
      continue;
    }
    
    if (typeof query[key] === 'object' && query[key] !== null) {
      sanitized[key] = sanitizeMongoQuery(query[key]);
    } else if (typeof query[key] === 'string') {
      sanitized[key] = sanitizeInput(query[key]);
    } else {
      sanitized[key] = query[key];
    }
  }
  
  return sanitized;
}

// Request validation
export function validateRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  if (!origin) return true; // Same-origin requests don't have origin header
  
  const allowedOrigins = [
    `http://localhost:3000`,
    `https://${host}`,
    process.env.NEXTAUTH_URL || ''
  ];
  
  return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

// API Key validation (for external integrations)
export function validateAPIKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const validKeys = process.env.API_KEYS?.split(',') || [];
  
  if (validKeys.length === 0) return true; // No API keys configured
  
  return validKeys.includes(apiKey || '');
}

// Audit logging
interface AuditLog {
  timestamp: string;
  userId?: string;
  action: string;
  resource: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'failure';
  details?: string;
}

const auditLogs: AuditLog[] = [];
const MAX_LOGS = 10000;

export function logAudit(log: Omit<AuditLog, 'timestamp'>): void {
  auditLogs.push({
    ...log,
    timestamp: new Date().toISOString()
  });
  
  // Keep only recent logs
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.shift();
  }
  
  // In production, write to database or external logging service
  if (process.env.NODE_ENV === 'production') {
    console.log('[AUDIT]', JSON.stringify(log));
  }
}

export function getAuditLogs(limit: number = 100): AuditLog[] {
  return auditLogs.slice(-limit);
}

// Data encryption helpers
export function encrypt(text: string, key?: string): string {
  const secretKey = key || process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  
  const keyBuffer = crypto.createHash('sha256').update(secretKey).digest();
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText: string, key?: string): string {
  const secretKey = key || process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  const algorithm = 'aes-256-cbc';
  
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const keyBuffer = crypto.createHash('sha256').update(secretKey).digest();
  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
