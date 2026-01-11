// app/api/monitoring/id/archive/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection, toObjectId } from '@/lib/mongodb';

export async function PATCH(request: NextRequest) {
  try {
    // For static route, get ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection('monitoring_records');
    
    let result;
    try {
      result = await collection.updateOne(
        { _id: await toObjectId(id) },
        { 
          $set: { 
            is_archived: true, 
            archived_at: new Date(),
            updated_at: new Date() 
          } 
        }
      );
    } catch {
      result = await collection.updateOne(
        { id: id },
        { 
          $set: { 
            is_archived: true, 
            archived_at: new Date(),
            updated_at: new Date() 
          } 
        }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Monitoring record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Monitoring record archived successfully',
      success: true
    });

  } catch (error) {
    console.error('Error archiving monitoring record:', error);
    return NextResponse.json(
      { error: 'Failed to archive monitoring record' },
      { status: 500 }
    );
  }
}