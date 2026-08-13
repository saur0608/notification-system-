import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const machinesCollection = db.collection('machines');
    
    // Get all machines from MongoDB
    const machines = await machinesCollection.find({}).toArray();
    
    return NextResponse.json({
      success: true,
      count: machines.length,
      machines: machines
    });
  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
