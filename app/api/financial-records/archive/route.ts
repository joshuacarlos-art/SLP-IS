import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET() {
  try {
    const collection = await getCollection('financialRecords');
    
    // Only get archived records
    const records = await collection.find({ archived: true }).sort({ record_date: -1 }).toArray();
    
    console.log(`📁 Found ${records.length} archived financial records`);
    
    return NextResponse.json({ 
      success: true, 
      data: convertDocsIds(records),
      count: records.length 
    });
  } catch (error) {
    console.error('Error fetching archived financial records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch archived financial records' },
      { status: 500 }
    );
  }
}