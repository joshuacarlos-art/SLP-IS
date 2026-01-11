import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');

    if (!project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    const issuesCollection = db.collection('issues');
    
    const issues = await issuesCollection.find({
      project_id,
      is_archived: { $ne: true }
    }).sort({ date_reported: -1 }).toArray();

    // Convert all issues to have consistent id field
    const convertedIssues = issues.map(issue => ({
      ...issue,
      id: issue.id || issue._id?.toString()
    }));

    return NextResponse.json(convertedIssues);
  } catch (error: any) {
    console.error('Error fetching project issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project issues' },
      { status: 500 }
    );
  }
}