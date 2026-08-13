import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/types';
import { MaintenanceTask } from '@/lib/types-maintenance';

// GET /api/maintenance/tasks/[id]
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

    const task = await db.maintenanceTasks.getById(params.id);
    const companyId = (session.user as any).companyId;

    if (!task || task.companyId !== companyId) {
      return NextResponse.json(
        { success: false, error: 'Task not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task
    } as ApiResponse<MaintenanceTask>);
  } catch (error) {
    console.error('GET maintenance task error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// PUT /api/maintenance/tasks/[id]
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

    // Verify ownership
    const existingTask = await db.maintenanceTasks.getById(params.id);
    const companyId = (session.user as any).companyId;

    if (!existingTask || existingTask.companyId !== companyId) {
      return NextResponse.json(
        { success: false, error: 'Task not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const body = await request.json();
    const updatedTask = await db.maintenanceTasks.update(params.id, body);

    if (!updatedTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTask
    } as ApiResponse<MaintenanceTask>);
  } catch (error) {
    console.error('PUT maintenance task error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// DELETE /api/maintenance/tasks/[id]
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

    // Verify ownership
    const existingTask = await db.maintenanceTasks.getById(params.id);
    const companyId = (session.user as any).companyId;

    if (!existingTask || existingTask.companyId !== companyId) {
      return NextResponse.json(
        { success: false, error: 'Task not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const success = await db.maintenanceTasks.delete(params.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Task not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    } as ApiResponse<null>);
  } catch (error) {
    console.error('DELETE maintenance task error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
