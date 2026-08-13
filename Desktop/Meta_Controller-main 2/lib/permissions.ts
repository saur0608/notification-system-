// Permission checking utilities for employees

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { EmployeePermissions } from './types-employee';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions?: EmployeePermissions;
}

/**
 * Get employee permissions from database
 */
export async function getEmployeePermissions(email: string): Promise<EmployeePermissions | null> {
  try {
    const employee = await db.employees.getByEmail(email);
    if (!employee) return null;
    return employee.permissions;
  } catch (error) {
    console.error('Error fetching employee permissions:', error);
    return null;
  }
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(permissionKey: keyof EmployeePermissions): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return false;

    // Admin always has all permissions
    if (session.user.role === 'admin') return true;

    // Get employee permissions
    const permissions = await getEmployeePermissions(session.user.email);
    if (!permissions) return false;

    return permissions[permissionKey] === true;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Check multiple permissions (user must have ALL)
 */
export async function hasAllPermissions(permissionKeys: (keyof EmployeePermissions)[]): Promise<boolean> {
  const checks = await Promise.all(permissionKeys.map(key => hasPermission(key)));
  return checks.every(check => check === true);
}

/**
 * Check multiple permissions (user must have AT LEAST ONE)
 */
export async function hasAnyPermission(permissionKeys: (keyof EmployeePermissions)[]): Promise<boolean> {
  const checks = await Promise.all(permissionKeys.map(key => hasPermission(key)));
  return checks.some(check => check === true);
}

/**
 * Middleware helper to enforce permission in API routes
 */
export async function requirePermission(permissionKey: keyof EmployeePermissions): Promise<{
  authorized: boolean;
  session: any;
  error?: string;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { authorized: false, session: null, error: 'Unauthorized - Please sign in' };
  }

  // Admin always has access
  if (session.user.role === 'admin') {
    return { authorized: true, session };
  }

  // Check employee permissions
  const hasAccess = await hasPermission(permissionKey);
  if (!hasAccess) {
    return { authorized: false, session, error: 'Insufficient permissions' };
  }

  return { authorized: true, session };
}

/**
 * Get all permissions for current user
 */
export async function getCurrentUserPermissions(): Promise<EmployeePermissions | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    return await getEmployeePermissions(session.user.email);
  } catch (error) {
    console.error('Error getting current user permissions:', error);
    return null;
  }
}
