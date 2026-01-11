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

    // Calculate basic metrics
    const totalPigs = new Set(records.map((r: any) => r.pigId)).size;
    
    const weightGains = records.filter((r: any) => r.weightGain).map((r: any) => r.weightGain);
    const averageWeightGain = weightGains.length > 0 
      ? Number((weightGains.reduce((a: number, b: number) => a + b, 0) / weightGains.length).toFixed(3))
      : 0;

    const fcrs = records.filter((r: any) => r.feedConversionRatio).map((r: any) => r.feedConversionRatio);
    const feedConversionRatio = fcrs.length > 0
      ? Number((fcrs.reduce((a: number, b: number) => a + b, 0) / fcrs.length).toFixed(2))
      : 0;

    const averageHealthScore = records.length > 0 
      ? Number((records.reduce((sum: number, record: any) => sum + record.healthScore, 0) / records.length).toFixed(1))
      : 0;

    // Generate monthly data (simplified)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthlyData = months.map((month, index) => {
      const monthRecords = records.filter((record: any) => 
        record.date.getMonth() === index && record.date.getFullYear() === year
      );

      if (monthRecords.length > 0) {
        const avgWeight = monthRecords.reduce((sum: number, record: any) => sum + record.weight, 0) / monthRecords.length;
        return {
          month,
          monthNumber: index + 1,
          averageWeight: Number(avgWeight.toFixed(2)),
          weightGain: averageWeightGain,
          feedConversionRatio,
          mortalityCount: 0,
          totalPigs: new Set(monthRecords.map((r: any) => r.pigId)).size,
          healthScore: averageHealthScore
        };
      } else {
        return {
          month,
          monthNumber: index + 1,
          averageWeight: 0,
          weightGain: 0,
          feedConversionRatio: 0,
          mortalityCount: 0,
          totalPigs: 0,
          healthScore: 0
        };
      }
    });

    const metrics = {
      year,
      totalPigs,
      averageWeightGain,
      mortalityRate: 0, // You can add actual mortality data here
      feedConversionRatio,
      averageHealthScore,
      monthlyData
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      {
        year: 2025,
        totalPigs: 0,
        averageWeightGain: 0,
        mortalityRate: 0,
        feedConversionRatio: 0,
        averageHealthScore: 0,
        monthlyData: []
      },
      { status: 200 }
    );
  }
}