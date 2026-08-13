import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Machine, ApiResponse } from '@/lib/types';
import { requirePermission } from '@/lib/permissions';

// GET /api/machines/[id] - Get machine by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check view permission and get session
    const { authorized, error, session } = await requirePermission('canViewMachines');
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: error || 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const machine = await db.machines.getById(params.id);
    const companyId = (session.user as any).companyId;
    
    if (!machine || machine.companyId !== companyId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Machine not found'
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse<Machine> = {
      success: true,
      data: machine
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('GET machine by ID error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error?.message || 'Failed to fetch machine'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/machines/[id] - Update machine
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check edit permission
    const { authorized, error, session } = await requirePermission('canEditMachine');
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: error || 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    // Verify ownership
    const existingMachine = await db.machines.getById(params.id);
    const companyId = (session.user as any).companyId;

    if (!existingMachine || existingMachine.companyId !== companyId) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const body = await request.json();
    const updatedMachine = await db.machines.update(params.id, body);
    
    if (!updatedMachine) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Machine not found'
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse<Machine> = {
      success: true,
      data: updatedMachine,
      message: 'Machine updated successfully'
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('PUT machine error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error?.message || 'Failed to update machine'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/machines/[id] - Delete machine
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check delete permission
    const { authorized, error, session } = await requirePermission('canDeleteMachine');
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: error || 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    // Verify ownership
    const existingMachine = await db.machines.getById(params.id);
    const companyId = (session.user as any).companyId;

    if (!existingMachine || existingMachine.companyId !== companyId) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const deleted = await db.machines.delete(params.id);
    
    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Machine not found'
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse<null> = {
      success: true,
      message: 'Machine deleted successfully'
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('DELETE machine error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error?.message || 'Failed to delete machine'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
