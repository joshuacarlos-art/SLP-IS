import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : 2025;

    // For now, return empty insights since we don't have real data
    const insights: any[] = [];

    // You can add default insights here if needed
    if (year === 2025) {
      insights.push({
        type: 'warning',
        title: 'No Data Available',
        description: 'Start adding performance metrics to see insights',
        metric: 'Data Collection',
        value: 0,
        trend: 'stable'
      });
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error fetching performance insights:', error);
    return NextResponse.json([], { status: 200 });
  }
}