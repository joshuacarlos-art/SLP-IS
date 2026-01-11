import { NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET() {
  try {
    const collection = await getCollection('monitoring_records');
    const records = await collection.find({}).toArray();
    
    return NextResponse.json({
      totalRecords: records.length,
      records: convertDocsIds(records)
    });
  } catch (error) {
    console.error('Error testing monitoring records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring records' },
      { status: 500 }
    );
  }
}