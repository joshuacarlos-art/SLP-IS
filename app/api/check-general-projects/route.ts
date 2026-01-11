import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const collection = await getCollection('general_projects');
    const count = await collection.countDocuments();
    const projects = await collection.find({}).limit(5).toArray();

    return NextResponse.json({
      success: true,
      count: count,
      sampleProjects: projects,
      message: `Found ${count} projects in general_projects collection`
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'general_projects collection might not exist'
    }, { status: 500 });
  }
}