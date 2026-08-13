import { NextResponse } from 'next/server';

export async function GET() {
  // Simulating dashboard metrics data
  const metrics = {
    messagesToday: "1,248,593",
    delivered: "1,234,002",
    failed: "14,591",
    queued: "5,302",
    deliveryRate: "98.8"
  };

  return NextResponse.json({ metrics });
}
