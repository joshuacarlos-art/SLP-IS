import { NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET() {
  try {
    const collection = await getCollection('associations');
    const associations = await collection
      .find({})
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(convertDocsIds(associations));
  } catch (error) {
    console.error('Error fetching associations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch associations' },
      { status: 500 }
    );
  }
}