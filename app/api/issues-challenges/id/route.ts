import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/issues-challenges/id?id=123 - Get single issue
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    
    const issue = await db.collection('issues_challenges').findOne({
      _id: new ObjectId(id)
    });
    
    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }
    
    const convertedIssue = {
      ...issue,
      _id: issue._id.toString(),
      id: issue._id.toString()
    };
    
    return NextResponse.json(convertedIssue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

// DELETE /api/issues-challenges/id?id=123 - Delete issue
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    
    const result = await db.collection('issues_challenges').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting issue:', error);
    return NextResponse.json(
      { error: 'Failed to delete issue' },
      { status: 500 }
    );
  }
}

// PATCH /api/issues-challenges/id?id=123 - Update issue
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      );
    }
    
    const updateData = await request.json();
    
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    
    const result = await db.collection('issues_challenges').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }
    
    // Return the updated issue
    const updatedIssue = await db.collection('issues_challenges').findOne({
      _id: new ObjectId(id)
    });
    
    const convertedIssue = {
      ...updatedIssue,
      _id: updatedIssue!._id.toString(),
      id: updatedIssue!._id.toString()
    };
    
    return NextResponse.json(convertedIssue);
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}