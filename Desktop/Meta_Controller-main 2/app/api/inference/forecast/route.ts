import { NextRequest, NextResponse } from 'next/server';
import { forecastLoad } from '@/lib/onnx/inference';
import { ApiResponse } from '@/lib/types';

// POST /api/inference/forecast - Forecast future load using GRU
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.loadHistory || !Array.isArray(body.loadHistory)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required field: loadHistory (array of 24 load values)'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    if (body.loadHistory.length !== 24) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'loadHistory must contain exactly 24 values'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const forecast = await forecastLoad(body.loadHistory);
    
    const response: ApiResponse<typeof forecast> = {
      success: true,
      data: forecast
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Load forecast error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to forecast load'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
