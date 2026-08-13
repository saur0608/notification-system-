import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/types';
import { Employee, defaultPermissions } from '@/lib/types-employee';

// GET /api/employees - Get all employees
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const email = searchParams.get('email');

    // If email is provided, anyone can fetch their own employee data
    if (email) {
      const employee = await db.employees.getByEmail(email);
      if (employee && employee.email === session.user.email) {
        return NextResponse.json({
          success: true,
          data: [employee]
        } as ApiResponse<Employee[]>);
      }
      // Only admin can fetch other users' data by email
      if (session.user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' } as ApiResponse<null>,
          { status: 403 }
        );
      }
      return NextResponse.json({
        success: true,
        data: employee ? [employee] : []
      } as ApiResponse<Employee[]>);
    }

    // Check if user has permission to manage employees for listing all
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const companyId = (session.user as any).companyId;
    let employees = await db.employees.getAll(companyId);

    // Filter by status
    if (status) {
      employees = employees.filter(emp => emp.status === status);
    }

    // Filter by role
    if (role) {
      employees = employees.filter(emp => emp.role === role);
    }

    return NextResponse.json({
      success: true,
      data: employees
    } as ApiResponse<Employee[]>);
  } catch (error) {
    console.error('GET employees error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// POST /api/employees - Create a new employee
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Check if user has permission to manage employees
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, email, role' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate password if provided
    if (body.password && body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmployee = await db.employees.getByEmail(body.email);
    if (existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Generate employee ID
    const employeeId = await db.employees.generateEmployeeId();

    // Get default permissions for role
    const permissions = body.permissions || defaultPermissions[body.role as keyof typeof defaultPermissions];

    const companyId = (session.user as any).companyId;

    const employeeData = {
      companyId: companyId,
      employeeId,
      name: body.name,
      email: body.email,
      password: body.password, // Include password for hashing
      role: body.role,
      status: body.status || 'active',
      department: body.department,
      position: body.position,
      phone: body.phone,
      hireDate: body.hireDate || new Date().toISOString(),
      permissions,
      createdBy: session.user.email || '',
    };

    const newEmployee = await db.employees.create(employeeData);

    return NextResponse.json({
      success: true,
      data: newEmployee
    } as ApiResponse<Employee>);
  } catch (error) {
    console.error('POST employee error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create employee' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
