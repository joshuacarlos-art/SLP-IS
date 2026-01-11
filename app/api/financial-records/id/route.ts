import { NextRequest, NextResponse } from 'next/server';
import { getCollection, toObjectId, convertDocId } from '@/lib/mongodb';

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing record ID' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    console.log('🔧 [UPDATE] Updating record ID:', id);
    console.log('📦 [UPDATE] Update data:', updateData);

    const collection = await getCollection('financialRecords');
    
    // Convert string ID to ObjectId using your utility
    let objectId;
    try {
      objectId = await toObjectId(id);
    } catch (error) {
      console.error('❌ [UPDATE] Invalid ID format:', id);
      return NextResponse.json(
        { success: false, error: 'Invalid financial record ID format' },
        { status: 400 }
      );
    }

    // Remove fields that shouldn't be updated
    const { _id, created_at, archived, ...cleanUpdateData } = updateData;
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          ...cleanUpdateData,
          updated_at: new Date()
        } 
      }
    );

    console.log('📊 [UPDATE] MongoDB update result:', result);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Financial record not found' },
        { status: 404 }
      );
    }

    // Return the updated record
    const updatedRecord = await collection.findOne({ _id: objectId });
    
    if (!updatedRecord) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch updated record' },
        { status: 500 }
      );
    }

    console.log('✅ [UPDATE] Record updated successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Financial record updated successfully',
      data: convertDocId(updatedRecord)
    });
    
  } catch (error) {
    console.error('💥 [UPDATE] Error updating financial record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update financial record' },
      { status: 500 }
    );
  }
}

// Also handle GET for single record
export async function GET(request: NextRequest) {
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

    const record = await collection.findOne({ _id: objectId });
    
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Financial record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: convertDocId(record)
    });
    
  } catch (error) {
    console.error('Error fetching financial record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch financial record' },
      { status: 500 }
    );
  }
}