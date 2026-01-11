import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.pig_id || !body.user_id || !body.user_name || !body.comment) {
      return NextResponse.json(
        { error: 'pig_id, user_id, user_name, and comment are required' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection('pig_comments');
    
    const newComment = {
      pig_id: body.pig_id,
      user_id: body.user_id,
      user_name: body.user_name,
      user_role: body.user_role || 'admin',
      comment: body.comment,
      comment_type: body.comment_type || 'general', // 'health', 'feeding', 'breeding', 'general'
      created_at: new Date(),
      updated_at: new Date()
    };
    
    await collection.insertOne(newComment);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Comment added successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pigId = searchParams.get('pigId');
    
    if (!pigId) {
      return NextResponse.json(
        { error: 'pigId is required' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection('pig_comments');
    const comments = await collection.find({ pig_id: pigId })
      .sort({ created_at: -1 })
      .toArray();
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}