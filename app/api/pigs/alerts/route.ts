import { NextRequest, NextResponse } from 'next/server';
import { PigPerformanceService } from '@/services/pigPerformanceService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pigId = searchParams.get('pigId');

    if (!pigId) {
      return NextResponse.json(
        { error: 'pigId is required' },
        { status: 400 }
      );
    }

    const alerts = await PigPerformanceService.getActiveAlerts(pigId);
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { error: 'alertId is required' },
        { status: 400 }
      );
    }

    await PigPerformanceService.resolveAlert(alertId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resolving alert:', error);
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    );
  }
}