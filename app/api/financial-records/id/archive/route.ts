import { NextRequest, NextResponse } from 'next/server';
import { getCollection, toObjectId } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing record ID' },
        { status: 400 }
      );
    }

    const collection = await getCollection('financialRecords');
    
    let objectId;
    try {
      objectId = await toObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid financial record ID format' },
        { status: 400 }
      );
    }

    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          archived: true,
          updated_at: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Financial record not found' },
        { status: 404 }
      );
    }

    console.log('✅ Record archived successfully:', id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Financial record archived successfully'
    });
    
  } catch (error) {
    console.error('Error archiving financial record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to archive financial record' },
      { status: 500 }
    );
  }
}