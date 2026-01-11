import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    const assessmentsCollection = db.collection('final_assessments');

    if (id) {
      // Get single assessment
      let assessment = await assessmentsCollection.findOne({ id: id });
      
      if (!assessment) {
        try {
          const { ObjectId } = await import('mongodb');
          if (ObjectId.isValid(id)) {
            const objectId = new ObjectId(id);
            assessment = await assessmentsCollection.findOne({ _id: objectId });
            
            if (assessment) {
              assessment = {
                ...assessment,
                id: assessment._id.toString()
              };
            }
          }
        } catch (error) {
          console.log('Not a valid ObjectId');
        }
      }
      
      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }
      
      return NextResponse.json(assessment);
    } else {
      // Get all assessments
      const assessments = await assessmentsCollection.find({}).sort({ created_at: -1 }).toArray();

      const convertedAssessments = assessments.map(assessment => ({
        ...assessment,
        id: assessment.id || assessment._id?.toString()
      }));
      
      return NextResponse.json(convertedAssessments);
    }
  } catch (error: any) {
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
    
    const requiredFields = ['project_id', 'project_name', 'accomplished_by'];
    const missingFields = requiredFields.filter(field => !assessmentData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    const assessmentsCollection = db.collection('final_assessments');
    
    // Generate ID
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const assessmentId = `assessment_${timestamp}_${randomStr}`;
    
    const newAssessment = {
      ...assessmentData,
      id: assessmentId,
      created_at: new Date(),
      updated_at: new Date()
    };

    await assessmentsCollection.insertOne(newAssessment);
    
    return NextResponse.json(
      { 
        message: 'Assessment created successfully',
        id: assessmentId
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    const assessmentsCollection = db.collection('final_assessments');
      
    let result = await assessmentsCollection.deleteOne({ id: id });

    if (result.deletedCount === 0) {
      try {
        const { ObjectId } = await import('mongodb');
        if (ObjectId.isValid(id)) {
          const objectId = new ObjectId(id);
          result = await assessmentsCollection.deleteOne({ _id: objectId });
        }
      } catch (error) {
        console.log('Not a valid ObjectId for delete');
      }
    }

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Assessment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
}