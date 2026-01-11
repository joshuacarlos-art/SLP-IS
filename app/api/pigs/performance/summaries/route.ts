import { NextRequest, NextResponse } from 'next/server';
import { PigPerformanceService } from '@/services/pigPerformanceService';

export async function POST(request: NextRequest) {
  try {
    const summaryData = await request.json();

    if (!summaryData.pigId || !summaryData.period || !summaryData.summary) {
      return NextResponse.json(
        { error: 'pigId, period, and summary are required' },
        { status: 400 }
      );
    }

    await PigPerformanceService.createPerformanceSummary(summaryData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating summary:', error);
    return NextResponse.json(
      { error: 'Failed to create summary' },
      { status: 500 }
    );
  }
}

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

    const summaries = await PigPerformanceService.getPerformanceSummaries(pigId);
    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summaries' },
      { status: 500 }
    );
  }
}