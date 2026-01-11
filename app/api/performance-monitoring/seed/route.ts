// app/api/performance-monitoring/seed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting to seed performance monitoring data...');

    // Get collections
    const performanceCollection = await getCollection('performance_metrics');
    const pigsCollection = await getCollection('pigs');
    const weightRecordsCollection = await getCollection('weight_records');
    const healthRecordsCollection = await getCollection('health_records');

    // 1. Create performance_metrics collection data
    console.log('Creating performance_metrics collection...');
    
    // Yearly summary for 2025
    const yearlyMetrics = {
      year: '2025',
      type: 'yearly',
      totalPigs: 1247,
      avgWeightGain: 1.8,
      mortalityRate: 2.3,
      feedConversionRatio: 2.4,
      healthyPigs: 864,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Monthly data for 2025
    const monthlyData = [
      { year: '2025', type: 'monthly', month: 'January', monthNumber: 1, avgWeight: 25.4, trend: 'up' },
      { year: '2025', type: 'monthly', month: 'February', monthNumber: 2, avgWeight: 26.1, trend: 'up' },
      { year: '2025', type: 'monthly', month: 'March', monthNumber: 3, avgWeight: 27.3, trend: 'up' },
      { year: '2025', type: 'monthly', month: 'April', monthNumber: 4, avgWeight: 26.8, trend: 'down' },
      { year: '2025', type: 'monthly', month: 'May', monthNumber: 5, avgWeight: 28.2, trend: 'up' },
      { year: '2025', type: 'monthly', month: 'June', monthNumber: 6, avgWeight: 29.1, trend: 'up' },
      { year: '2025', type: 'monthly', month: 'July', monthNumber: 7, avgWeight: 30.4, trend: 'up' },
      { year: '2025', type: 'monthly', month: 'August', monthNumber: 8, avgWeight: 31.2, trend: 'up' },
      { year: '2025', type: 'monthly', month: 'September', monthNumber: 9, avgWeight: 32.1, trend: 'up' },
      { year: '2025', type: 'monthly', month: 'October', monthNumber: 10, avgWeight: 33.4, trend: 'up' },
      { year: '2025', type: 'monthly', month: 'November', monthNumber: 11, avgWeight: 34.2, trend: 'up' },
      { year: '2025', type: 'monthly', month: 'December', monthNumber: 12, avgWeight: 35.1, trend: 'up' }
    ];

    // Clear existing performance data and insert new
    await performanceCollection.deleteMany({});
    await performanceCollection.insertOne(yearlyMetrics);
    await performanceCollection.insertMany(monthlyData);

    console.log('Performance metrics data inserted');

    // 2. If you want to also create sample weight records for more realistic data
    console.log('Creating sample weight records...');
    
    // Get some existing pigs to create weight records for
    const existingPigs = await pigsCollection.find({}).limit(10).toArray();
    
    const weightRecords = [];
    for (const pig of existingPigs) {
      // Create 3 months of weight history for each pig
      for (let i = 0; i < 3; i++) {
        const recordDate = new Date();
        recordDate.setMonth(recordDate.getMonth() - i);
        
        const baseWeight = pig.weight || 30;
        const monthlyWeight = baseWeight - (i * 8); // Simulate growth
        
        weightRecords.push({
          pigId: pig._id,
          earTag: pig.earTag,
          weight: Math.max(10, monthlyWeight),
          recordDate: recordDate,
          recordedBy: 'system',
          notes: 'Sample weight record for performance monitoring',
          createdAt: new Date()
        });
      }
    }

    if (weightRecords.length > 0) {
      await weightRecordsCollection.insertMany(weightRecords);
      console.log(`Created ${weightRecords.length} sample weight records`);
    }

    // 3. Verify the data was created
    const performanceCount = await performanceCollection.countDocuments();
    const weightRecordsCount = await weightRecordsCollection.countDocuments();

    return NextResponse.json({ 
      success: true, 
      message: 'Performance monitoring data seeded successfully!',
      dataCreated: {
        performanceMetrics: performanceCount,
        sampleWeightRecords: weightRecordsCount
      },
      collections: {
        created: ['performance_metrics'],
        updated: ['weight_records']
      },
      nextSteps: [
        'Refresh MongoDB Compass - you should now see performance_metrics collection',
        'Visit /admin/reports/performance-monitoring to see the dashboard',
        'Check the performance_metrics collection for your analytics data'
      ]
    });

  } catch (error) {
    console.error('Error seeding performance data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed performance data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}