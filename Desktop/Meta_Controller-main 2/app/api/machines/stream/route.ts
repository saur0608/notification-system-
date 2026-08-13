import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// Stream machine data from MongoDB
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const startTime = searchParams.get('startTime');

    // Fetch real-time machine data
    let query: any = {};
    
    if (machineId) {
      query.machineId = machineId;
    }

    if (startTime) {
      query.timestamp = { $gte: new Date(startTime) };
    }

    // Get machine sensor history from MongoDB
    const sensorData = await db.sensorData.getHistory(
      machineId || undefined,
      limit,
      startTime || undefined
    );

    return NextResponse.json({
      success: true,
      data: sensorData,
      count: sensorData.length,
    });
  } catch (error) {
    console.error('Machine Data Stream Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Save machine sensor data to MongoDB
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      machineId,
      rpm,
      load,
      current,
      temperature,
      vibration,
      torque,
      loadKw,
      health,
      efficiency,
      status,
      predictions,
    } = body;

    // Validate required fields
    if (!machineId) {
      return NextResponse.json(
        { error: 'machineId is required' },
        { status: 400 }
      );
    }

    // Save to MongoDB
    const sensorRecord = {
        machineId,
        timestamp: new Date().toISOString(),
        rpm: rpm || 0,
        load: load || 0,
        current: current || 0,
        temperature: temperature || 0,
        vibration: vibration || 0,
        torque: torque || 0,
        loadKw: loadKw || 0,
        health: health || 100,
        efficiency: efficiency || 0,
        status: status || 'unknown',
        predictions: predictions || null,
    };

    await db.sensorData.add(sensorRecord);

    return NextResponse.json({
      success: true,
      data: sensorRecord,
    });
  } catch (error) {
    console.error('Save Sensor Data Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
