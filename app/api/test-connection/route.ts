import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Exists' : 'Missing');
    console.log('DATABASE_NAME:', process.env.DATABASE_NAME || 'slp (default)');

    const collection = await getCollection('caretakers');
    console.log('Successfully connected to collection');

    // Try to count documents
    const count = await collection.countDocuments();
    console.log(`Collection has ${count} documents`);

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      documentCount: count,
      database: process.env.DATABASE_NAME || 'slp'
    });

  } catch (error: any) {
    console.error('MongoDB connection failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'MongoDB connection failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}