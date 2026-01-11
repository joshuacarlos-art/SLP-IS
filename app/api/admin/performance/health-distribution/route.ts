import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : 2025;

    // Calculate start and end dates for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const collection = await getCollection('pig_performance');
    
    const records = await collection
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .toArray();

    // Calculate health status distribution
    const distribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      critical: 0
    };

    records.forEach((record: any) => {
      const healthScore = record.healthScore;
      if (healthScore >= 9) distribution.excellent++;
      else if (healthScore >= 7) distribution.good++;
      else if (healthScore >= 5) distribution.fair++;
      else if (healthScore >= 3) distribution.poor++;
      else distribution.critical++;
    });

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Error fetching health distribution:', error);
    return NextResponse.json(
      { 
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
        critical: 0
      },
      { status: 200 } // Return empty data instead of error for better UX
    );
  }
}