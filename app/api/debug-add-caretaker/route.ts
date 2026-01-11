import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function POST() {
  try {
    const collection = await getCollection('caretakers');
    
    const testCaretaker = {
      id: `TEST${Date.now().toString().slice(-6)}`,
      firstName: "Test",
      lastName: "User",
      participantType: "Individual",
      sex: "Male",
      contactNumber: "+63 912 345 6789",
      slpAssociation: "Test Association",
      barangay: "Test Barangay",
      cityMunicipality: "Test City",
      province: "Test Province",
      region: "Test Region",
      modality: "Test Modality",
      dateProvided: "2024-01-01",
      status: "active",
      email: "test.user@care.com",
      dateStarted: "2024-01-01",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Attempting to insert test caretaker:', testCaretaker);
    
    const result = await collection.insertOne(testCaretaker);
    console.log('Insert result:', result);

    return NextResponse.json({
      success: true,
      message: 'Test caretaker added successfully',
      insertedId: result.insertedId,
      caretaker: testCaretaker
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error adding test caretaker:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to add test caretaker',
      message: error.message
    }, { status: 500 });
  }
}