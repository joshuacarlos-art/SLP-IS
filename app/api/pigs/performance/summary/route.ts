import { NextRequest, NextResponse } from 'next/server';
import { getCollection, findDocument } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pigId = searchParams.get('pigId');
    const timeRange = searchParams.get('timeRange') || '30d';
    
    if (!pigId) {
      return NextResponse.json(
        { error: 'pigId is required' },
        { status: 400 }
      );
    }

    const pigsCollection = await getCollection('pigs');
    
    // Use helper to find pig
    const pig = await findDocument(pigsCollection, pigId);
    
    if (!pig) {
      return NextResponse.json({ 
        error: 'Pig not found',
        performanceScore: 0,
        averageDailyGain: 0,
        averageFeedConversionRatio: 0,
        healthTrend: 'stable',
        message: 'No pig found with this ID'
      });
    }

    // Calculate date range
    const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get related records using the pig's ID (convert to string for query)
    const pigIdStr = pig.id?.toString() || pig.pig_tag_number || pigId;
    
    const weightCollection = await getCollection('weight_records');
    const feedingCollection = await getCollection('feeding_records');
    const healthCollection = await getCollection('health_records');
    
    const [weightData, feedingData, healthData] = await Promise.all([
      weightCollection.find({
        pig_id: pigIdStr,
        date: { $gte: startDate }
      }).sort({ date: 1 }).toArray(),
      
      feedingCollection.find({
        pig_id: pigIdStr,
        date: { $gte: startDate }
      }).toArray(),
      
      healthCollection.find({
        pig_id: pigIdStr,
        date: { $gte: startDate }
      }).sort({ date: 1 }).toArray()
    ]);

    // Calculate performance metrics
    let averageDailyGain = 0;
    if (weightData.length >= 2) {
      const firstWeight = weightData[0]?.weight || 0;
      const lastWeight = weightData[weightData.length - 1]?.weight || 0;
      const weightGain = lastWeight - firstWeight;
      
      if (weightData.length > 1 && weightGain > 0) {
        const firstDate = new Date(weightData[0].date);
        const lastDate = new Date(weightData[weightData.length - 1].date);
        const daysBetween = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24));
        averageDailyGain = weightGain / daysBetween;
      }
    }

    let averageFeedConversionRatio = 0;
    if (feedingData.length > 0 && averageDailyGain > 0) {
      const totalFeed = feedingData.reduce((sum: number, record: any) => sum + (record.feed_amount || 0), 0);
      averageFeedConversionRatio = totalFeed / (averageDailyGain * days) || 0;
    }

    // Calculate health score
    let healthScore = 100;
    if (pig.health_status) {
      const healthScores: Record<string, number> = {
        'Excellent': 100,
        'Good': 80,
        'Fair': 60,
        'Poor': 40,
        'Critical': 20
      };
      healthScore = healthScores[pig.health_status] || 60;
    }

    // Calculate performance score
    const performanceScore = Math.min(100, Math.max(0,
      (Math.min(averageDailyGain * 20, 40)) + // Weight gain contributes up to 40 points
      (Math.min(10 / (averageFeedConversionRatio || 1), 30)) + // Feed efficiency contributes up to 30 points
      (healthScore * 0.3) // Health contributes up to 30 points
    ));

    // Determine trend
    const healthTrend = healthData.length >= 2 ? 
      (healthData[healthData.length - 1]?.health_status === 'Good' || 
       healthData[healthData.length - 1]?.health_status === 'Excellent' ? 'improving' : 'stable') 
      : 'stable';

    return NextResponse.json({
      pigId: pigIdStr,
      pigTagNumber: pig.pig_tag_number,
      breed: pig.breed,
      currentWeight: pig.current_weight || 0,
      healthStatus: pig.health_status || 'Unknown',
      performanceScore: Math.round(performanceScore),
      performanceLevel: performanceScore >= 80 ? 'Excellent' : 
                       performanceScore >= 60 ? 'Good' : 
                       performanceScore >= 40 ? 'Fair' : 'Poor',
      averageDailyGain: averageDailyGain.toFixed(2),
      averageFeedConversionRatio: averageFeedConversionRatio.toFixed(2),
      averageHealthScore: Math.round(healthScore),
      healthTrend,
      totalWeightRecords: weightData.length,
      totalFeedingRecords: feedingData.length,
      totalHealthRecords: healthData.length,
      lastUpdate: pig.updated_at?.toISOString() || pig.created_at?.toISOString(),
      period: timeRange
    });
    
  } catch (error) {
    console.error('Error calculating performance summary:', error);
    return NextResponse.json(
      { error: 'Failed to calculate performance summary' },
      { status: 500 }
    );
  }
}