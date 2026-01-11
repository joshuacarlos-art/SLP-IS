import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocId } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const projectsCollection = await getCollection('general_projects');
    const project = await projectsCollection.findOne({ project_id: id });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(convertDocId(project));
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const updateData = await request.json();
    const projectsCollection = await getCollection('general_projects');

    // Ensure arrays are properly handled
    const sanitizedUpdateData = {
      ...updateData,
      objectives: updateData.objectives || [],
      challenges: updateData.challenges || [],
      achievements: updateData.achievements || [],
      photos: updateData.photos || [],
      documents: updateData.documents || [],
      updatedAt: new Date()
    };

    const result = await projectsCollection.updateOne(
      { project_id: id },
      { 
        $set: sanitizedUpdateData
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const projectsCollection = await getCollection('general_projects');

    const result = await projectsCollection.updateOne(
      { project_id: id },
      { 
        $set: {
          archived: true,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Project archived successfully'
    });
  } catch (error: any) {
    console.error('Error archiving project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}