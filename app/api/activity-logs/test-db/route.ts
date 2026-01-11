import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    const activityLogsCollection = db.collection('activityLogs');
    const activityCount = await activityLogsCollection.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      database: db.databaseName,
      collections: collectionNames,
      activityLogsCount: activityCount
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return NextResponse.json({
      success: false,
      error: 'MongoDB connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}