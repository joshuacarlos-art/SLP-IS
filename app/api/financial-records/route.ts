import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET() {
  try {
    const collection = await getCollection('financialRecords');
    
    // Get only non-archived records, sorted by latest first
    const records = await collection.find({ archived: { $ne: true } })
      .sort({ record_date: -1, created_at: -1 })
      .toArray();

    console.log(`📊 Found ${records.length} active financial records`);
    
    return NextResponse.json({ 
      success: true, 
      data: convertDocsIds(records),
      count: records.length 
    });
    
  } catch (error) {
    console.error('Error fetching financial records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch financial records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const recordData = await request.json();
    
    console.log('➕ Creating new financial record:', recordData);

    const collection = await getCollection('financialRecords');
    
    const newRecord = {
      ...recordData,
      archived: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await collection.insertOne(newRecord);
    
    const insertedRecord = await collection.findOne({ _id: result.insertedId });
    
    console.log('✅ Record created successfully:', result.insertedId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Financial record created successfully',
      data: convertDocsIds([insertedRecord])[0]
    });
    
  } catch (error) {
    console.error('Error creating financial record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create financial record' },
      { status: 500 }
    );
  }
}