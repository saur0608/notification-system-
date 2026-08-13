# MetaController Security Features

## Implemented Security Measures

### 1. **Authentication & Authorization**
- ✅ NextAuth.js with Google OAuth
- ✅ Credential-based authentication with bcrypt password hashing
- ✅ Role-based access control (RBAC): Admin, Engineer, Operator, Viewer
- ✅ Account locking after 5 failed login attempts (30-minute lockout)
- ✅ Session management with JWT tokens (30-day expiration)

### 2. **Rate Limiting**
Route-specific limits implemented in `lib/rate-limit.ts`:
- `/api/auth`: 5 requests/minute (prevents brute force)
- `/api/machines`: 100 requests/minute
- `/api/inference`: 30 requests/minute (ML operations)
- `/api/simulator`: 120 requests/minute (real-time data)
- `/api/analysis`: 20 requests/minute (heavy computation)
- Default: 60 requests/minute

Rate limit headers included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `Retry-After` (on 429 errors)

### 3. **Security Headers**
All responses include (via `lib/security.ts`):
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Strict-Transport-Security` - Enforces HTTPS
- `Content-Security-Policy` - Restricts resource loading
- `Referrer-Policy` - Controls referrer information
- `Permissions-Policy` - Disables unnecessary browser features

### 4. **Input Sanitization**
- ✅ XSS prevention (removes `<>`, `javascript:`, event handlers)
- ✅ MongoDB injection prevention (blocks `$` operators in queries)
- ✅ String length limits (max 1000 characters)
- ✅ Recursive object sanitization

### 5. **Data Protection**
- ✅ MongoDB integration with connection pooling
- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ AES-256-CBC encryption for sensitive data
- ✅ Environment variable isolation

### 6. **Audit Logging**
All API requests logged with:
- Timestamp
- User ID (if authenticated)
- Action performed
- Resource accessed
- IP address
- User agent
- Success/failure status
- Request details

Audit logs stored in MongoDB `audit_logs` collection.

### 7. **Threat Detection**
- ✅ Suspicious activity tracking (IP-based)
- ✅ Automatic IP blocking after 100 failed attempts
- ✅ Origin validation for API requests
- ✅ API key validation (optional for external integrations)

## MongoDB Collections

### users
```typescript
{
  _id: ObjectId,
  email: string,
  name: string,
  image?: string,
  role: 'admin' | 'engineer' | 'operator' | 'viewer',
  department?: string,
  passwordHash?: string,
  googleId?: string,
  isActive: boolean,
  loginAttempts: number,
  lockedUntil?: Date,
  lastLogin?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### machines
```typescript
{
  _id: ObjectId,
  machineId: string,
  name: string,
  type: string,
  status: 'running' | 'idle' | 'maintenance' | 'fault',
  sensorData: {
    rpm, vibration, temperature, current, load, timestamp
  },
  predictions?: {...},
  maintenanceHistory: [...],
  createdAt, updatedAt, createdBy, updatedBy
}
```

### audit_logs
```typescript
{
  _id: ObjectId,
  timestamp: Date,
  userId?: ObjectId,
  action: string,
  resource: string,
  ip: string,
  userAgent: string,
  status: 'success' | 'failure',
  details?: string
}
```

### alerts
```typescript
{
  _id: ObjectId,
  machineId: ObjectId,
  type: 'fault' | 'warning' | 'maintenance' | 'anomaly',
  severity: 'low' | 'medium' | 'high' | 'critical',
  status: 'active' | 'acknowledged' | 'resolved',
  createdAt, acknowledgedAt, resolvedAt
}
```

## Environment Variables

### Required
```env
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Optional
```env
ENCRYPTION_KEY=your-encryption-key
API_KEYS=comma-separated-api-keys
NODE_ENV=development|production
```

## Security Best Practices

### Production Deployment
1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS** - Vercel provides this automatically
4. **Rotate secrets** - Change keys every 90 days
5. **Monitor audit logs** - Review for suspicious activity
6. **Update dependencies** - Run `npm audit fix` regularly

### User Management
- **Admin users**: Full access, create sparingly
- **Engineer users**: Can analyze and simulate, cannot delete
- **Operator users**: Can view and operate, no analysis
- **Viewer users**: Read-only access

### Password Policy (for credential-based auth)
- Minimum 8 characters
- Hashed with bcrypt (10 rounds)
- Account locks after 5 failed attempts
- 30-minute lockout period

## API Security

### Protected Routes
All routes under `/machines`, `/simulator`, `/analytics`, and `/api/*` require authentication.

### Role-Based Permissions
- **DELETE operations**: Admin only
- **Simulator/Analytics**: Engineer+ only
- **Viewer role**: Read-only, blocks POST/PUT/DELETE

### Request Validation
```typescript
// All requests validated for:
- Valid session token
- Rate limit compliance
- Origin validation
- Input sanitization
- CSRF protection (for state-changing operations)
```

## Testing Security

### Test Rate Limiting
```powershell
# Send 10 requests rapidly
1..10 | ForEach-Object {
  Invoke-RestMethod -Uri "http://localhost:3000/api/machines" -Method GET
}
```

### Test Authentication
```powershell
# Without auth (should fail)
Invoke-RestMethod -Uri "http://localhost:3000/api/machines" -Method POST

# With auth (should succeed)
$headers = @{ "Authorization" = "Bearer your-token" }
Invoke-RestMethod -Uri "http://localhost:3000/api/machines" -Method POST -Headers $headers
```

### Test Input Sanitization
```powershell
# XSS attempt (should be sanitized)
$body = @{
  name = "<script>alert('xss')</script>Machine"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/machines" -Method POST -Body $body
```

## Monitoring & Alerts

### Check Audit Logs
```powershell
# View recent activity
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/audit-logs?limit=50"
```

### Check Blocked IPs
```powershell
# View blocked IP addresses
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/blocked-ips"
```

### Machine Statistics
```powershell
# Get security metrics
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/stats"
```

## Compliance

This platform implements security measures aligned with:
- **OWASP Top 10** - Protection against common vulnerabilities
- **GDPR** - User data protection and audit trails
- **SOC 2** - Access controls and logging
- **ISO 27001** - Information security management

## Support

For security concerns or to report vulnerabilities, contact: security@metacontroller.com
