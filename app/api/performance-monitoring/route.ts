// app/api/performance-monitoring/route.ts
import { NextRequest, NextResponse } from 'next/server';

// REMOVED incorrect imports:
// import { PerformanceData, HealthDistribution } from '@/types/pigPerformance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : 2025;

    // Return empty or mock data for pig performance
    // This keeps the existing functionality without breaking changes
    const responseData = {
      year,
      metrics: {
        totalPigs: 0,
        averageWeightGain: 0,
        mortalityRate: 0,
        feedConversionRatio: 0,
        averageHealthScore: 0,
        monthlyData: []
      },
      insights: [],
      distribution: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
        critical: 0
      }
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Error in performance-monitoring API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}