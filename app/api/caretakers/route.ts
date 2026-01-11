// app/api/caretakers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const association = searchParams.get('association');
    
    let query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (association) {
      query.slpAssociation = association;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { slpAssociation: { $regex: search, $options: 'i' } }
      ];
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    const caretakers = await db.collection('caretakers')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    const convertedCaretakers = caretakers.map((caretaker: any) => ({
      ...caretaker,
      _id: caretaker._id.toString(),
      fullName: `${caretaker.firstName} ${caretaker.lastName}`,
      dateStarted: caretaker.dateProvided
    }));
    
    return NextResponse.json(convertedCaretakers);
  } catch (error) {
    console.error('Error fetching caretakers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch caretakers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const caretakerData = await request.json();
    
    const requiredFields = [
      'firstName', 'lastName', 'participantType', 'sex', 
      'slpAssociation', 'barangay', 'cityMunicipality', 
      'province', 'region', 'modality', 'dateProvided'
    ];
    
    const missingFields = requiredFields.filter(field => !caretakerData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    const collection = db.collection('caretakers');

    const caretakerId = `CT${Date.now().toString().slice(-6)}`;
    
    const newCaretaker = {
      ...caretakerData,
      id: caretakerId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      fullName: `${caretakerData.firstName} ${caretakerData.lastName}`,
      dateStarted: caretakerData.dateProvided
    };

    const result = await collection.insertOne(newCaretaker);
    
    const insertedCaretaker = {
      ...newCaretaker,
      _id: result.insertedId.toString()
    };

    return NextResponse.json({ 
      success: true, 
      caretaker: insertedCaretaker 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating caretaker:', error);
    return NextResponse.json(
      { error: 'Failed to create caretaker' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('DELETE request received for ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Caretaker ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    
    let query: any;
    
    // Try ObjectId first, then fall back to string id
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { id: id };
    }
    
    console.log('Query for deletion:', query);
    
    const result = await db.collection('caretakers').deleteOne(query);

    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Caretaker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Caretaker deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting caretaker:', error);
    return NextResponse.json(
      { error: 'Failed to delete caretaker' },
      { status: 500 }
    );
  }
}