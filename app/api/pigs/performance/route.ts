// app/api/pigs/performance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds, convertDocId } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pigId = searchParams.get('pigId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    
    const collection = await getCollection('pig_performance');
    let query = {};
    
    if (pigId) {
      query = { pigId: pigId };
    }
    
    const performanceData = await collection.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
    
    return NextResponse.json(convertDocsIds(performanceData));
  } catch (error) {
    console.error('Error fetching pig performance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch pig performance data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getCollection('pig_performance');
    
    // Calculate additional metrics
    const performanceData = {
      ...body,
      id: `PERF${Date.now().toString().slice(-6)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(performanceData);
    return NextResponse.json(convertDocId({ ...performanceData, _id: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error('Error creating performance record:', error);
    return NextResponse.json(
      { error: 'Failed to create performance record' },
      { status: 500 }
    );
  }
}