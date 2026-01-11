import { NextRequest, NextResponse } from 'next/server';
import { PigPerformanceService } from '@/services/pigPerformanceService';

export async function POST(request: NextRequest) {
  try {
    const { pigIds } = await request.json();

    if (!pigIds || !Array.isArray(pigIds)) {
      return NextResponse.json(
        { error: 'pigIds array is required' },
        { status: 400 }
      );
    }

    const comparisons = await PigPerformanceService.getPerformanceComparison(pigIds);
    return NextResponse.json(comparisons);
  } catch (error) {
    console.error('Error fetching performance comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance comparison' },
      { status: 500 }
    );
  }
}