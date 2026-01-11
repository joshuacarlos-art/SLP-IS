import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    const issuesCollection = db.collection('issues');

    if (id) {
      // Get single issue - try both id field and _id
      let issue;
      
      // First try to find by string id field
      issue = await issuesCollection.findOne({ id: id });
      
      // If not found by string id, try by _id (ObjectId)
      if (!issue) {
        try {
          const { ObjectId } = await import('mongodb');
          if (ObjectId.isValid(id)) {
            const objectId = new ObjectId(id);
            issue = await issuesCollection.findOne({ _id: objectId });
            
            // If found by _id, convert it to have both _id and id fields
            if (issue) {
              issue = {
                ...issue,
                id: issue._id.toString()
              };
            }
          }
        } catch (error) {
          console.log('Not a valid ObjectId, continuing with string id');
        }
      }
      
      if (!issue) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
      }
      
      return NextResponse.json(issue);
    } else {
      // Get all issues
      const issues = await issuesCollection.find({
        is_archived: { $ne: true }
      }).sort({ date_reported: -1 }).toArray();

      // Convert all issues to have consistent id field
      const convertedIssues = issues.map(issue => ({
        ...issue,
        id: issue.id || issue._id?.toString()
      }));
      
      return NextResponse.json(convertedIssues);
    }
  } catch (error: any) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const issueData = await request.json();
    
    // Validate required fields
    const requiredFields = ['project_id', 'project_name', 'issue_category', 'issue_code', 'title', 'description', 'reported_by'];
    const missingFields = requiredFields.filter(field => !issueData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    const issuesCollection = db.collection('issues');
    
    // Generate a simple ID using timestamp + random string
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const issueId = `issue_${timestamp}_${randomStr}`;
    
    // Create new issue with timestamp
    const newIssue = {
      ...issueData,
      id: issueId,
      created_at: new Date(),
      updated_at: new Date(),
      is_archived: false
    };

    const result = await issuesCollection.insertOne(newIssue);
    
    return NextResponse.json(
      { 
        message: 'Issue created successfully',
        id: issueId
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Issue ID is required' }, { status: 400 });
    }

    const updateData = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    const issuesCollection = db.collection('issues');
      
    // Remove id from update data to prevent changing the ID
    const { id: _, ...dataToUpdate } = updateData;
    
    let result;
    
    // First try to update by string id field
    result = await issuesCollection.updateOne(
      { id: id },
      { 
        $set: {
          ...dataToUpdate,
          updated_at: new Date()
        }
      }
    );

    // If not found by string id, try by _id (ObjectId)
    if (result.matchedCount === 0) {
      try {
        const { ObjectId } = await import('mongodb');
        if (ObjectId.isValid(id)) {
          const objectId = new ObjectId(id);
          result = await issuesCollection.updateOne(
            { _id: objectId },
            { 
              $set: {
                ...dataToUpdate,
                updated_at: new Date()
              }
            }
          );
        }
      } catch (error) {
        console.log('Not a valid ObjectId for update');
      }
    }

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Issue updated successfully' });
  } catch (error: any) {
    console.error('Error updating issue:', error);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Issue ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME || 'slp');
    const issuesCollection = db.collection('issues');
      
    let result;
    
    // First try to delete by string id field
    result = await issuesCollection.updateOne(
      { id: id },
      { 
        $set: {
          is_archived: true,
          updated_at: new Date()
        }
      }
    );

    // If not found by string id, try by _id (ObjectId)
    if (result.matchedCount === 0) {
      try {
        const { ObjectId } = await import('mongodb');
        if (ObjectId.isValid(id)) {
          const objectId = new ObjectId(id);
          result = await issuesCollection.updateOne(
            { _id: objectId },
            { 
              $set: {
                is_archived: true,
                updated_at: new Date()
              }
            }
          );
        }
      } catch (error) {
        console.log('Not a valid ObjectId for delete');
      }
    }

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Issue deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting issue:', error);
    return NextResponse.json(
      { error: 'Failed to delete issue' },
      { status: 500 }
    );
  }
}