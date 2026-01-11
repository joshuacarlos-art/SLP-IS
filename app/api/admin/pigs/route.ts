import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const collection = await getCollection('pigs');
    
    const pigs = await collection
      .find({}, { projection: { _id: 1, name: 1, tagNumber: 1, status: 1 } })
      .toArray();

    // Convert MongoDB _id to string for the frontend
    const formattedPigs = pigs.map(pig => ({
      ...pig,
      _id: pig._id.toString()
    }));

    return NextResponse.json(formattedPigs);
  } catch (error) {
    console.error('Error fetching pigs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pigs' },
      { status: 500 }
    );
  }
}