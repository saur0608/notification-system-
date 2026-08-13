import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/types';
import { MaintenanceTask } from '@/lib/types-maintenance';
import { requirePermission } from '@/lib/permissions';

// GET /api/maintenance/tasks - Get all maintenance tasks
export async function GET(request: Request) {
  try {
    // Check view permission
    const { authorized, error, session } = await requirePermission('canViewMaintenanceTasks');
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: error || 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let tasks: MaintenanceTask[];
    const companyId = (session.user as any).companyId;

    if (machineId) {
      tasks = await db.maintenanceTasks.getByMachine(machineId, companyId);
    } else {
      tasks = await db.maintenanceTasks.getAll(companyId);
    }

    // Filter by status
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    // Filter by priority
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }

    // Check for overdue tasks
    const now = new Date();
    tasks = tasks.map(task => {
      if (
        task.status !== 'completed' &&
        task.status !== 'cancelled' &&
        new Date(task.scheduledDate) < now
      ) {
        return { ...task, status: 'overdue' as const };
      }
      return task;
    });

    return NextResponse.json({
      success: true,
      data: tasks
    } as ApiResponse<MaintenanceTask[]>);
  } catch (error) {
    console.error('GET maintenance tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance tasks' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// POST /api/maintenance/tasks - Create a new maintenance task
export async function POST(request: Request) {
  try {
    // Check create permission
    const { authorized, session, error } = await requirePermission('canCreateMaintenanceTask');
    if (!authorized || !session?.user) {
      return NextResponse.json(
        { success: false, error: error || 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.machineId || !body.title || !body.type || !body.scheduledDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Get machine details
    const machine = await db.machines.getById(body.machineId);
    if (!machine) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const companyId = (session.user as any).companyId;
    
    // Verify machine belongs to company
    if (machine.companyId !== companyId) {
      return NextResponse.json(
        { success: false, error: 'Machine not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const taskData = {
      companyId: companyId,
      machineId: body.machineId,
      machineName: machine.name,
      title: body.title,
      description: body.description || '',
      type: body.type,
      priority: body.priority || 'medium',
      status: body.status || 'pending',
      assignedTo: body.assignedTo,
      assignedToName: body.assignedToName,
      scheduledDate: body.scheduledDate,
      completedDate: body.completedDate,
      estimatedDuration: body.estimatedDuration || 1,
      actualDuration: body.actualDuration,
      cost: body.cost,
      parts: body.parts || [],
      notes: body.notes,
      attachments: body.attachments || [],
      createdBy: session.user.email || '',
    };

    const newTask = await db.maintenanceTasks.create(taskData);

    return NextResponse.json({
      success: true,
      data: newTask
    } as ApiResponse<MaintenanceTask>);
  } catch (error) {
    console.error('POST maintenance task error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create maintenance task' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
