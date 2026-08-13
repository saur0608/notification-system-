import { NextRequest, NextResponse } from 'next/server';
import { detectAnomaly } from '@/lib/onnx/inference';
import { ApiResponse } from '@/lib/types';

// POST /api/inference/anomaly - Detect anomalies using Autoencoder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.vibration || !body.current || !body.temperature) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: vibration, current, temperature'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const sensorData = {
      vibration: body.vibration,
      current: body.current,
      temperature: body.temperature
    };
    
    const anomalyResult = await detectAnomaly(sensorData);
    
    const response: ApiResponse<typeof anomalyResult> = {
      success: true,
      data: anomalyResult
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Anomaly detection error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to detect anomaly'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
