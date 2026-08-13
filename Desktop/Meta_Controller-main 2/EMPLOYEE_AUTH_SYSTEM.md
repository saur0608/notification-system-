# Employee Authentication & Permissions System

## Overview
Complete employee management system with password-based authentication and granular role-based permissions.

## Features Implemented

### 1. Employee Data Model
**File:** `lib/types-employee.ts`

- **passwordHash**: Stored securely with bcrypt (10 salt rounds)
- **loginAttempts**: Track failed login attempts
- **lockedUntil**: Auto-lock after 5 failed attempts (30 minutes)
- **lastLogin**: Track last successful login timestamp
- **12 Granular Permissions:**
  - `canCreateMachine`
  - `canEditMachine`
  - `canDeleteMachine`
  - `canViewMachines`
  - `canCreateMaintenanceTask`
  - `canEditMaintenanceTask`
  - `canDeleteMaintenanceTask`
  - `canViewMaintenanceTasks`
  - `canViewReports`
  - `canManageEmployees`
  - `canViewAnalytics`
  - `canAccessSimulator`

### 2. Database Operations
**File:** `lib/db.ts`

- **Password Hashing:** Automatic on create/update via bcrypt
- **Auto-generated Employee IDs:** EMP001, EMP002, etc.
- **CRUD Operations:** Full employee lifecycle management

### 3. Authentication Flow
**File:** `app/api/auth/[...nextauth]/route.ts`

#### Employee Login Process:
1. Check `employees` collection first
2. Validate employee status (active/inactive/suspended)
3. Check account lock status
4. Verify password with bcrypt
5. Increment login attempts on failure (lock after 5)
6. Reset attempts and update lastLogin on success
7. Fallback to `users` collection for OAuth users

#### Supported Login Methods:
- **Credentials:** Email + Password (for employees)
- **Google OAuth:** For admin/existing users
- **Account Lock:** 30 minutes after 5 failed attempts

### 4. Employee API Routes

#### POST /api/employees
**File:** `app/api/employees/route.ts`
- Create new employee with password
- Password validation (min 6 characters)
- Email uniqueness check
- Auto-generate employee ID
- Apply default permissions by role

#### GET /api/employees
- List all employees (admin only)
- Filter by status, role
- Fetch by email (user can fetch own data)

#### PUT /api/employees/[id]
**File:** `app/api/employees/[id]/route.ts`
- Update employee details
- Change password (auto-hashed)
- Update permissions
- Email uniqueness validation

#### DELETE /api/employees/[id]
- Remove employee (admin only)

### 5. Permission System
**File:** `lib/permissions.ts`

#### Server-Side Functions:
- `hasPermission(key)`: Check single permission
- `hasAllPermissions(keys[])`: Require all permissions
- `hasAnyPermission(keys[])`: Require at least one
- `requirePermission(key)`: Middleware helper for API routes
- `getEmployeePermissions(email)`: Fetch from database
- `getCurrentUserPermissions()`: Get session user's permissions

#### Usage in API Routes:
```typescript
const { authorized, session, error } = await requirePermission('canCreateMachine');
if (!authorized) {
  return NextResponse.json({ success: false, error }, { status: 403 });
}
```

### 6. Frontend Hook
**File:** `hooks/useEmployeePermissions.ts`

Client-side permission checking:
```typescript
const { hasPermission, isAdmin, loading } = useEmployeePermissions();

if (hasPermission('canCreateMachine')) {
  // Show create button
}
```

### 7. Protected API Routes

#### Machines API
**Files:** `app/api/machines/route.ts`, `app/api/machines/[id]/route.ts`
- GET: Requires `canViewMachines`
- POST: Requires `canCreateMachine`
- PUT: Requires `canEditMachine`
- DELETE: Requires `canDeleteMachine`

#### Maintenance Tasks API
**File:** `app/api/maintenance/tasks/route.ts`
- GET: Requires `canViewMaintenanceTasks`
- POST: Requires `canCreateMaintenanceTask`

### 8. Employee Forms

#### Add Employee Form
**File:** `app/employees/new/page.tsx`
- Name, email, password (required)
- Phone, hire date, department, position (optional)
- Role selector with descriptions
- Status selector (active/inactive/suspended)
- 12 permission checkboxes
- Auto-populate permissions based on role
- Individual permission toggles
- Password validation (min 6 chars)

## Default Permission Sets

### Admin
- All permissions enabled

### Engineer
- All machine permissions (create, edit, view)
- All maintenance task permissions (create, edit, view)
- View reports
- View analytics
- Access simulator
- Cannot delete machines/tasks
- Cannot manage employees

### Operator
- Edit machines (no create/delete)
- Create/edit maintenance tasks (no delete)
- View machines and tasks
- No reports, analytics, simulator, or employee management

### Viewer
- View machines only
- View maintenance tasks
- View reports
- View analytics
- No create/edit/delete permissions

## Security Features

### Password Security
- Bcrypt hashing (10 salt rounds)
- Minimum 6 characters
- Auto-hashed on create/update
- Never exposed in API responses

### Account Protection
- Login attempt tracking
- Auto-lock after 5 failures
- 30-minute lock duration
- Status-based access control (active/inactive/suspended)

### Authorization
- Session-based authentication (NextAuth)
- Permission checks on all protected routes
- Admin bypass for all permissions
- Employee can fetch own data only

## Login Credentials

Employees log in at `/auth/signin` with:
- Email: Their employee email
- Password: Set during employee creation

## Permission Customization

Admins can:
1. Create employee with default role permissions
2. Customize individual permissions via checkboxes
3. Update permissions anytime via edit page
4. Suspend or deactivate accounts

## Integration Points

### Session Data
After login, session contains:
- `id`: Employee/User ID
- `email`: Email address
- `name`: Full name
- `role`: Role (admin/engineer/operator/viewer)

### Permission Checks
Server: Use `requirePermission()` in API routes
Client: Use `useEmployeePermissions()` hook

## Database Collections

### employees
- Auto-generated IDs (EMP001, EMP002...)
- Password hashes (bcrypt)
- Permissions object
- Login tracking (attempts, lastLogin, lockedUntil)
- Status tracking (active/inactive/suspended)

### users
- OAuth users (Google)
- Legacy credential users
- Maintains separate collection for compatibility

## Testing

### Create Test Employee
1. Go to `/employees/new`
2. Fill form with email and password
3. Select role and permissions
4. Click Create

### Login as Employee
1. Go to `/auth/signin`
2. Choose "Sign in with Credentials"
3. Enter employee email and password
4. Access system with assigned permissions

### Verify Permissions
1. Try accessing protected routes
2. Check permission errors (403)
3. Verify buttons/features hidden based on permissions

## Error Handling

### Login Errors
- Invalid credentials: "Sign in failed. Check the details you provided are correct."
- Account locked: "Account is temporarily locked. Try again later."
- Account suspended: "Account is suspended. Contact administrator."
- Account inactive: "Account is inactive. Contact administrator."

### Permission Errors
- 401 Unauthorized: Not logged in
- 403 Forbidden: Insufficient permissions
- 400 Bad Request: Invalid data (e.g., short password)

## Future Enhancements

1. Password reset flow
2. Two-factor authentication
3. Password complexity requirements
4. Session timeout configuration
5. Audit log for permission changes
6. Bulk employee import
7. Employee role templates
8. Permission groups/sets
