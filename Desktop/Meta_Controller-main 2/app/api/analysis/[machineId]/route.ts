import { NextRequest, NextResponse } from 'next/server';
import { DecisionEngine } from '@/lib/decision-engine';
import { db } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// POST /api/analysis/[machineId] - Run complete ML analysis
export async function POST(
  request: NextRequest,
  { params }: { params: { machineId: string } }
) {
  try {
    const machine = await db.machines.getById(params.machineId);

    if (!machine) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Machine not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (!machine.sensorData) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'No sensor data available for analysis'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();
    
    // Prepare load history (use provided or generate synthetic)
    const loadHistory = body.loadHistory || generateSyntheticLoadHistory(
      machine.sensorData.load,
      24
    );

    // Target load (use provided or default to 80% of max)
    const targetLoad = body.targetLoad || machine.specifications.maxLoad * 0.8;

    // Run decision engine
    const result = await DecisionEngine.analyze(
      params.machineId,
      {
        rpm: machine.sensorData.rpm,
        vibration: machine.sensorData.vibration,
        temperature: machine.sensorData.temperature,
        current: machine.sensorData.current,
        load: machine.sensorData.load,
        timestamp: machine.sensorData.timestamp
      },
      {
        values: loadHistory,
        sequenceLength: 24
      },
      targetLoad
    );

    // Map action
    const actionMap: Record<string, 'decrease' | 'hold' | 'increase'> = {
      'decrease_load': 'decrease',
      'hold_load': 'hold',
      'increase_load': 'increase'
    };

    // Update machine with predictions
    await db.machines.update(params.machineId, {
      predictions: {
        anomalyScore: result.anomalyDetection.reconstructionError,
        isAnomaly: result.anomalyDetection.isAnomaly,
        nextState: {
            vibration: result.statePrediction.vibration,
            temperature: result.statePrediction.temperature,
            rpm: machine.sensorData?.rpm || 0,
            current: machine.sensorData?.current || 0
        },
        loadForecast: [result.loadForecast.predictedLoad],
        recommendedAction: actionMap[result.loadOptimization.action] || 'hold',
        confidence: result.loadOptimization.confidence
      }
    });

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// GET /api/analysis/[machineId]/report - Get formatted text report
export async function GET(
  request: NextRequest,
  { params }: { params: { machineId: string } }
) {
  try {
    const machine = await db.machines.getById(params.machineId);

    if (!machine || !machine.sensorData) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Machine or sensor data not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Run quick analysis
    const loadHistory = generateSyntheticLoadHistory(machine.sensorData.load, 24);
    const targetLoad = machine.specifications.maxLoad * 0.8;

    const result = await DecisionEngine.analyze(
      params.machineId,
      {
        rpm: machine.sensorData.rpm,
        vibration: machine.sensorData.vibration,
        temperature: machine.sensorData.temperature,
        current: machine.sensorData.current,
        load: machine.sensorData.load,
        timestamp: machine.sensorData.timestamp
      },
      {
        values: loadHistory,
        sequenceLength: 24
      },
      targetLoad
    );

    const report = DecisionEngine.generateReport(result);

    return new NextResponse(report, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="machine-${params.machineId}-report.txt"`
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return new NextResponse('Failed to generate report', { status: 500 });
  }
}

// Helper function to generate synthetic load history
function generateSyntheticLoadHistory(currentLoad: number, length: number): number[] {
  const history: number[] = [];
  let load = currentLoad;

  for (let i = 0; i < length; i++) {
    // Add some variation around current load
    const variation = (Math.random() - 0.5) * currentLoad * 0.15;
    const trend = Math.sin(i * 0.2) * currentLoad * 0.1;
    load = Math.max(0, currentLoad + variation + trend);
    history.push(parseFloat(load.toFixed(2)));
  }

  return history;
}
