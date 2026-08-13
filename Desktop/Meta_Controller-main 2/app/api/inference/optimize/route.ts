import { NextRequest, NextResponse } from 'next/server';
import { optimizeLoad } from '@/lib/onnx/inference';
import { ApiResponse } from '@/lib/types';

// POST /api/inference/optimize - Get optimal load action using DQN Agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.currentLoad || !body.targetLoad) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: currentLoad, targetLoad'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const optimization = await optimizeLoad(body.currentLoad);
    
    const response: ApiResponse<typeof optimization> = {
      success: true,
      data: optimization
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Load optimization error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to optimize load'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
