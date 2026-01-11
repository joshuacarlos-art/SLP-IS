import { NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET() {
  try {
    const collection = await getCollection('projects');
    const projects = await collection
      .find({})
      .sort({ 'enterpriseSetup.projectName': 1 })
      .toArray();

    return NextResponse.json(convertDocsIds(projects));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}