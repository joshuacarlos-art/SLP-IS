// app/api/test/route.ts
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    const collection = await getCollection('associations');
    const count = await collection.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      associationCount: count
    });
  } catch (error: any) {
    console.error('❌ MongoDB connection test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'MongoDB connection failed: ' + error.message
    }, { status: 500 });
  }
}