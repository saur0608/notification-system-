import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

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
      history,
    } = body;

    // Validate required fields
    if (!machineId || rpm === undefined || load === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Note: ONNX models run in browser, so this endpoint primarily validates
    // and can optionally fetch historical data from MongoDB
    
    const predictions = {
      machineId,
      timestamp: new Date().toISOString(),
      sensorData: {
        rpm,
        load,
        current: current || 0,
        temperature: temperature || 0,
        vibration: vibration || 0,
        torque: torque || 0,
        loadKw: loadKw || 0,
      },
      // Client will compute these using ONNX models
      anomalyDetection: null,
      optimalAction: null,
      nextStatePrediction: null,
      message: 'Use client-side ONNX inference for predictions',
    };

    return NextResponse.json(predictions);
  } catch (error) {
    console.error('ML Prediction API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch historical data for a machine
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
    const limit = parseInt(searchParams.get('limit') || '24');

    if (!machineId) {
      return NextResponse.json(
        { error: 'machineId is required' },
        { status: 400 }
      );
    }

    // TODO: Fetch historical sensor data from MongoDB
    // For now, return empty array - will be implemented with MongoDB stream
    
    return NextResponse.json({
      machineId,
      history: [],
      message: 'Historical data endpoint - to be connected with MongoDB',
    });
  } catch (error) {
    console.error('Historical Data API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
