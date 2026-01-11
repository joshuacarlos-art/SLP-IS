import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET /api/issues-challenges - Get all issues with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const association_id = searchParams.get('association_id');
    const status = searchParams.get('status');

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    
    // Build filter object
    const filter: any = {};
    if (project_id) filter.project_id = project_id;
    if (association_id) filter.association_id = association_id;
    if (status) filter.status = status;

    const issues = await db.collection('issues_challenges')
      .find(filter)
      .sort({ date_reported: -1 })
      .toArray();
    
    const convertedIssues = issues.map((issue: any) => ({
      ...issue,
      _id: issue._id.toString(),
      id: issue._id.toString()
    }));
    
    return NextResponse.json(convertedIssues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

// POST /api/issues-challenges - Create new issue
export async function POST(request: NextRequest) {
  try {
    const issueData = await request.json();
    
    // Validate required fields (removed issue_category from required fields)
    const requiredFields = ['project_id', 'association_id', 'major_issue_challenge', 'status', 'date_reported'];
    const missingFields = requiredFields.filter(field => !issueData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    
    // Generate issue code
    const today = new Date();
    const year = today.getFullYear();
    const lastIssue = await db.collection('issues_challenges')
      .find({ issue_code: { $regex: `ISS-${year}-` } })
      .sort({ _id: -1 })
      .limit(1)
      .toArray();
    
    let nextNumber = 1;
    if (lastIssue.length > 0) {
      const lastCode = lastIssue[0].issue_code;
      const lastNumber = parseInt(lastCode.split('-')[2]) || 0;
      nextNumber = lastNumber + 1;
    }
    
    const issue_code = `ISS-${year}-${String(nextNumber).padStart(3, '0')}`;

    const newIssue = {
      ...issueData,
      issue_code,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('issues_challenges').insertOne(newIssue);
    
    const insertedIssue = {
      ...newIssue,
      _id: result.insertedId.toString(),
      id: result.insertedId.toString()
    };
    
    return NextResponse.json(insertedIssue, { status: 201 });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}