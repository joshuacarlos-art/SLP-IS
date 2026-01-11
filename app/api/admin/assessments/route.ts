import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: Fetch all assessments or assessments for a specific caretaker
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caretakerId = searchParams.get('caretakerId');

    const collection = await getCollection('caretaker_assessments');
    
    let query = {};
    if (caretakerId) {
      query = { caretakerId };
    }
    
    const assessments = await collection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    const formattedAssessments = assessments.map(assessment => ({
      ...assessment,
      _id: assessment._id.toString(),
      id: assessment._id.toString(),
      date: new Date(assessment.date).toISOString(),
      assessmentDate: assessment.assessmentDate ? new Date(assessment.assessmentDate).toISOString() : null
    }));

    return NextResponse.json(formattedAssessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

// POST: Create a new assessment
export async function POST(request: NextRequest) {
  try {
    const assessmentData = await request.json();
    
    if (!assessmentData.caretakerId || !assessmentData.rating) {
      return NextResponse.json(
        { error: 'Missing required fields: caretakerId and rating are required' },
        { status: 400 }
      );
    }

    const collection = await getCollection('caretaker_assessments');
    
    // Add timestamp and ensure proper date format
    const assessmentToInsert = {
      ...assessmentData,
      date: new Date(assessmentData.date || Date.now()),
      assessmentDate: assessmentData.assessmentDate ? new Date(assessmentData.assessmentDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating assessment:', assessmentToInsert);
    
    const result = await collection.insertOne(assessmentToInsert);
    
    // Fetch the created document
    const createdDoc = await collection.findOne({ _id: result.insertedId });
    
    if (!createdDoc) {
      throw new Error('Failed to retrieve created assessment');
    }

    const createdAssessment = {
      ...createdDoc,
      _id: createdDoc._id.toString(),
      id: createdDoc._id.toString()
    };

    console.log('Assessment created:', createdAssessment);
    
    return NextResponse.json(createdAssessment, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT: Update an assessment
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const assessmentData = await request.json();
    const collection = await getCollection('caretaker_assessments');
    
    const updateData = {
      ...assessmentData,
      updatedAt: new Date()
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Fetch and return the updated assessment
    const updatedAssessment = await collection.findOne({ _id: new ObjectId(id) });
    
    const formattedAssessment = {
      ...updatedAssessment,
      _id: updatedAssessment!._id.toString(),
      id: updatedAssessment!._id.toString()
    };

    return NextResponse.json(formattedAssessment);
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an assessment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection('caretaker_assessments');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
}