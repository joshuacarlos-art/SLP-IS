import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const collection = await getCollection('caretakers');
    
    const caretakers = await collection
      .find({}, { 
        projection: { 
          _id: 1, 
          firstName: 1, 
          lastName: 1, 
          email: 1, 
          status: 1, 
          slpAssociation: 1, 
          dateStarted: 1,
          phone: 1,
          contactNumber: 1
        } 
      })
      .toArray();

    // Convert MongoDB _id to string for the frontend
    const formattedCaretakers = caretakers.map(caretaker => ({
      ...caretaker,
      _id: caretaker._id.toString(),
      id: caretaker._id.toString()
    }));

    return NextResponse.json(formattedCaretakers);
  } catch (error) {
    console.error('Error fetching caretakers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch caretakers' },
      { status: 500 }
    );
  }
}