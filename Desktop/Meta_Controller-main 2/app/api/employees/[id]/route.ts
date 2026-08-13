import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/types';
import { Employee } from '@/lib/types-employee';

// GET /api/employees/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const employee = await db.employees.getById(params.id);
    const companyId = (session.user as any).companyId;

    if (!employee || employee.companyId !== companyId) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee
    } as ApiResponse<Employee>);
  } catch (error) {
    console.error('GET employee error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employee' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const body = await request.json();

    // Verify employee belongs to company
    const existing = await db.employees.getById(params.id);
    const companyId = (session.user as any).companyId;
    
    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // If email is being changed, check for duplicates
    if (body.email) {
      const existingEmployee = await db.employees.getByEmail(body.email);
      if (existingEmployee && existingEmployee.id !== params.id) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' } as ApiResponse<null>,
          { status: 400 }
        );
      }
    }

    // Validate password if provided
    if (body.password && body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const updatedEmployee = await db.employees.update(params.id, body);

    if (!updatedEmployee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedEmployee
    } as ApiResponse<Employee>);
  } catch (error) {
    console.error('PUT employee error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update employee' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    // Verify employee belongs to company
    const existing = await db.employees.getById(params.id);
    const companyId = (session.user as any).companyId;
    
    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const success = await db.employees.delete(params.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully'
    } as ApiResponse<null>);
  } catch (error) {
    console.error('DELETE employee error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete employee' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
