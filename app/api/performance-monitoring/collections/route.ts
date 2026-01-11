// app/api/performance-monitoring/collections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const collections = await db.listCollections().toArray();
    
    const collectionNames = collections.map(col => col.name);
    
    return NextResponse.json({
      database: process.env.DATABASE_NAME || 'slp',
      totalCollections: collections.length,
      collections: collectionNames,
      performanceMonitoringReady: collectionNames.includes('performance_metrics') && 
                                 collectionNames.includes('pigs') && 
                                 collectionNames.includes('associations')
    });
  } catch (error) {
    console.error('Error listing collections:', error);
    return NextResponse.json(
      { error: 'Failed to list collections' },
      { status: 500 }
    );
  }
}