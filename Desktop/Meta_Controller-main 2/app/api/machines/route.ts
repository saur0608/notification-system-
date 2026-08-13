import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Machine, ApiResponse } from '@/lib/types';
import { requirePermission } from '@/lib/permissions';

// GET /api/machines - Get all machines
export async function GET(request: NextRequest) {
  try {
    // Check view permission
    const { authorized, error, session } = await requirePermission('canViewMachines');
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: error || 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    
    const companyId = (session.user as any).companyId;
    let machines = await db.machines.getAll(companyId);
    
    // Filter by status if provided
    if (status) {
      machines = machines.filter(m => m.status === status);
    }
    
    // Filter by type if provided
    if (type) {
      machines = machines.filter(m => m.type === type);
    }
    
    const response: ApiResponse<Machine[]> = {
      success: true,
      data: machines
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('GET machines error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error?.message || 'Failed to fetch machines'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/machines - Create new machine
export async function POST(request: NextRequest) {
  try {
    // Check create permission
    const { authorized, error, session } = await requirePermission('canCreateMachine');
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: error || 'Insufficient permissions' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('Received machine data:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.name || !body.type || !body.location) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: name, type, location'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const companyId = (session.user as any).companyId;

    console.log('Creating machine...');
    const newMachine = await db.machines.create({
      companyId: companyId,
      name: body.name,
      type: body.type,
      location: body.location,
      manufacturer: body.manufacturer,
      model: body.model,
      serialNumber: body.serialNumber,
      status: body.status || 'idle',
      health: body.health || 100,
      efficiency: body.efficiency || 100,
      specifications: body.specifications || {
        maxRPM: 3000,
        maxLoad: 50,
        maxTemp: 80,
        powerRating: 15
      },
      sensorData: body.sensorData || {
        timestamp: new Date().toISOString(),
        rpm: 0,
        vibration: 0,
        temperature: 25,
        current: 0,
        load: 0
      }
    });
    
    console.log('Machine created:', newMachine.id);
    
    const response: ApiResponse<Machine> = {
      success: true,
      data: newMachine,
      message: 'Machine created successfully'
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Machine creation error:', error);
    console.error('Error stack:', error.stack);
    const response: ApiResponse<null> = {
      success: false,
      error: error?.message || 'Failed to create machine'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
