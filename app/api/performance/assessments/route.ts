// app/api/performance/assessments/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocId } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const assessmentData = await request.json();
    
    // Validate required fields
    if (!assessmentData.caretakerId || assessmentData.rating === undefined) {
      return NextResponse.json(
        { error: 'Caretaker ID and rating are required' },
        { status: 400 }
      );
    }

    const collection = await getCollection('assessments');
    
    // Prepare assessment data
    const newAssessment = {
      ...assessmentData,
      _id: new ObjectId(),
      id: new ObjectId().toString(),
      categories: assessmentData.categories || {
        punctuality: assessmentData.rating,
        communication: assessmentData.rating,
        patientCare: assessmentData.rating,
        professionalism: assessmentData.rating,
        technicalSkills: assessmentData.rating
      },
      date: assessmentData.date || assessmentData.assessmentDate || new Date(),
      assessmentDate: assessmentData.assessmentDate || assessmentData.date || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newAssessment);
    
    // Return in the format expected by frontend
    const insertedAssessment = convertDocId(newAssessment);
    
    return NextResponse.json(
      { 
        success: true, 
        assessment: insertedAssessment,
        insertedId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const collection = await getCollection('assessments');
    const { searchParams } = new URL(request.url);
    const caretakerId = searchParams.get('caretakerId');
    
    let query: any = {};
    if (caretakerId) {
      query.caretakerId = caretakerId;
    }
    
    const assessments = await collection.find(query).sort({ date: -1 }).toArray();
    
    // Convert ObjectId to string for all assessments
    const convertedAssessments = assessments.map(convertDocId);
    
    return NextResponse.json(convertedAssessments, { status: 200 });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json([], { status: 200 });
  }
}