// Debug endpoint to check employee password status
// DELETE THIS FILE AFTER DEBUGGING

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const employee = await db.employees.getByEmail(email);

    if (!employee) {
      return NextResponse.json(
        { found: false, message: 'Employee not found' }
      );
    }

    return NextResponse.json({
      found: true,
      email: employee.email,
      name: employee.name,
      hasPasswordHash: !!employee.passwordHash,
      passwordHashLength: employee.passwordHash?.length || 0,
      status: employee.status,
      role: employee.role,
      loginAttempts: employee.loginAttempts,
      lockedUntil: employee.lockedUntil,
      lastLogin: employee.lastLogin,
    });
  } catch (error) {
    console.error('Debug employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
