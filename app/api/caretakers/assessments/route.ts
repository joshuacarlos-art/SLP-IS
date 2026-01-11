import { NextRequest, NextResponse } from 'next/server';
import { 
  getAssessments, 
  createAssessment 
} from '@/lib/db/caretaker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caretakerId = searchParams.get('caretakerId');
    
    const assessments = await getAssessments(caretakerId || undefined);
    
    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const assessmentData = await request.json();
    
    // Validate required fields
    if (!assessmentData.caretakerId || !assessmentData.assessmentDate || 
        !assessmentData.rating || !assessmentData.assessedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assessment = await createAssessment(assessmentData);

    return NextResponse.json({ 
      success: true, 
      assessment 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}