import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocId, toObjectId } from '@/lib/mongodb';
import { PerformanceAssessment } from '@/components/caretaker/types';

export async function GET(request: NextRequest) {
  try {
    // Get ID from query parameters for static routes
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required as query parameter' },
        { status: 400 }
      );
    }

    const collection = await getCollection('assessments');
    
    const objectId = await toObjectId(id);
    const assessment = await collection.findOne({ _id: objectId });
    
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const convertedAssessment = convertDocId(assessment);
    return NextResponse.json(convertedAssessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required as query parameter' },
        { status: 400 }
      );
    }

    const updateData: Partial<PerformanceAssessment> = await request.json();
    const collection = await getCollection('assessments');
    
    const objectId = await toObjectId(id);
    const updateDoc = {
      ...updateData,
      updatedAt: new Date()
    };

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment updated successfully' 
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required as query parameter' },
        { status: 400 }
      );
    }

    const collection = await getCollection('assessments');
    
    const objectId = await toObjectId(id);
    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
}