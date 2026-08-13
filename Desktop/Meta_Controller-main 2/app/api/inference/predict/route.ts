import { NextRequest, NextResponse } from 'next/server';
import { predictNextState } from '@/lib/onnx/inference';
import { ApiResponse } from '@/lib/types';

// POST /api/inference/predict - Predict next machine state using LSTM Digital Twin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.rpm || !body.vibration || !body.temperature || !body.current) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: rpm, vibration, temperature, current'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const sensorData = {
      rpm: body.rpm,
      vibration: body.vibration,
      temperature: body.temperature,
      current: body.current
    };
    
    const prediction = await predictNextState([sensorData]);
    
    const response: ApiResponse<typeof prediction> = {
      success: true,
      data: prediction
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Prediction error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to predict next state'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
