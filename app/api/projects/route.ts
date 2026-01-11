import { NextRequest, NextResponse } from 'next/server';
import { getCollection, toObjectId, convertDocId } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all projects
export async function GET(): Promise<NextResponse> {
  try {
    console.log('🔄 API: Fetching all projects');
    
    const projectsCollection = await getCollection('projects');
    const projects = await projectsCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`✅ API: Found ${projects.length} projects`);
    
    const convertedProjects = projects.map(project => convertDocId(project));
    
    return NextResponse.json(convertedProjects);
  } catch (error) {
    console.error('💥 API: Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const projectData = await request.json();
    
    console.log('🔄 API: Creating new project');
    
    const projectsCollection = await getCollection('projects');
    
    const newProject = {
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await projectsCollection.insertOne(newProject);
    
    const insertedProject = {
      ...newProject,
      _id: result.insertedId.toString(),
      id: result.insertedId.toString()
    };
    
    console.log('✅ API: Project created successfully:', result.insertedId);
    
    return NextResponse.json(insertedProject, { status: 201 });
  } catch (error) {
    console.error('💥 API: Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// PUT - Update project - FIXED VERSION
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('🔄 API PUT: Starting update for project ID:', id);
    console.log('🔍 API PUT: ID details - type:', typeof id, 'length:', id?.length, 'value:', id);
    
    if (!id) {
      console.error('❌ API PUT: No ID provided');
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get the request data
    const projectData = await request.json();
    console.log('📦 API PUT: Received update data keys:', Object.keys(projectData));
    console.log('📦 API PUT: Association IDs:', projectData.associationIds);
    
    // Convert ID and get collection
    const projectsCollection = await getCollection('projects');
    
    // DEBUG: Check what's actually in the database
    console.log('🔍 API PUT: Checking database for projects...');
    const allProjects = await projectsCollection.find({}).limit(5).toArray();
    console.log('📋 API PUT: Sample projects in DB:', allProjects.map(p => ({
      _id: p._id?.toString(),
      id: p.id,
      name: p.enterpriseSetup?.projectName || p.projectName
    })));
    
    let existingProject = null;
    let queryMethod = '';
    let finalQuery: any = null;
    
    // Method 1: Try as MongoDB ObjectId
    console.log('🔍 API PUT: Trying ObjectId lookup...');
    try {
      const projectObjectId = await toObjectId(id);
      existingProject = await projectsCollection.findOne({ _id: projectObjectId });
      if (existingProject) {
        queryMethod = 'ObjectId';
        finalQuery = { _id: projectObjectId };
        console.log('✅ API PUT: Found project by ObjectId');
      } else {
        console.log('❌ API PUT: No project found with ObjectId');
      }
    } catch (error) {
      console.log('⚠️ API PUT: ObjectId conversion failed:', error instanceof Error ? error.message : error);
    }
    
    // Method 2: Try as string ID field
    if (!existingProject) {
      console.log('🔍 API PUT: Trying string ID lookup...');
      existingProject = await projectsCollection.findOne({ id: id });
      if (existingProject) {
        queryMethod = 'string_id';
        finalQuery = { id: id };
        console.log('✅ API PUT: Found project by string ID');
      } else {
        console.log('❌ API PUT: No project found with string ID');
      }
    }
    
    // Method 3: Try direct _id string lookup using ObjectId constructor
    if (!existingProject && id.length === 24) {
      console.log('🔍 API PUT: Trying direct _id string lookup with ObjectId...');
      try {
        const objectId = new ObjectId(id);
        existingProject = await projectsCollection.findOne({ _id: objectId });
        if (existingProject) {
          queryMethod = '_id_string_objectid';
          finalQuery = { _id: objectId };
          console.log('✅ API PUT: Found project by _id string with ObjectId');
        } else {
          console.log('❌ API PUT: No project found with _id string and ObjectId');
        }
      } catch (error) {
        console.log('⚠️ API PUT: ObjectId creation from string failed');
      }
    }
    
    // Method 4: Try to find by any field that might contain the ID
    if (!existingProject) {
      console.log('🔍 API PUT: Trying broad search across all projects...');
      const allProjects = await projectsCollection.find({}).toArray();
      const matchingProject = allProjects.find(p => {
        const projectIdStr = p._id?.toString();
        return projectIdStr === id || p.id === id;
      });
      if (matchingProject) {
        existingProject = matchingProject;
        queryMethod = 'broad_search';
        // Use the actual _id from the found project
        finalQuery = { _id: existingProject._id };
        console.log('✅ API PUT: Found project by broad search');
      }
    }
    
    if (!existingProject) {
      console.error('❌ API PUT: Project not found with any method');
      console.error('🔍 API PUT: Tried methods: ObjectId, string ID, _id string, broad search');
      console.error('🔍 API PUT: Available projects in database:', allProjects.length);
      
      // Return detailed error information
      return NextResponse.json(
        { 
          success: false,
          error: 'Project not found',
          debug: {
            searchedId: id,
            availableProjects: allProjects.length,
            sampleProjects: allProjects.slice(0, 3).map(p => ({
              _id: p._id?.toString(),
              id: p.id,
              name: p.enterpriseSetup?.projectName || p.projectName
            }))
          }
        },
        { status: 404 }
      );
    }
    
    console.log('✅ API PUT: Project found using method:', queryMethod);
    console.log('📋 API PUT: Found project details:', {
      _id: existingProject._id?.toString(),
      id: existingProject.id,
      name: existingProject.enterpriseSetup?.projectName || existingProject.projectName
    });
    
    // Create update object - only update the fields that are provided
    const updateFields: any = {
      updatedAt: new Date()
    };
    
    // Update association-related fields
    if (projectData.associationIds !== undefined) {
      updateFields.associationIds = projectData.associationIds;
      console.log('💾 API PUT: Setting associationIds:', projectData.associationIds);
    }
    if (projectData.associationId !== undefined) {
      updateFields.associationId = projectData.associationId;
      console.log('💾 API PUT: Setting associationId:', projectData.associationId);
    }
    if (projectData.associationName !== undefined) {
      updateFields.associationName = projectData.associationName;
      console.log('💾 API PUT: Setting associationName:', projectData.associationName);
    }
    if (projectData.isAssociationMember !== undefined) {
      updateFields.isAssociationMember = projectData.isAssociationMember;
      console.log('💾 API PUT: Setting isAssociationMember:', projectData.isAssociationMember);
    }
    if (projectData.membershipType !== undefined) {
      updateFields.membershipType = projectData.membershipType;
      console.log('💾 API PUT: Setting membershipType:', projectData.membershipType);
    }
    
    // Update operationalInformation if provided
    if (projectData.operationalInformation !== undefined) {
      updateFields.operationalInformation = {
        ...existingProject.operationalInformation, // Keep existing data
        ...projectData.operationalInformation // Override with new data
      };
      console.log('💾 API PUT: Updated operationalInformation with membership details');
    }
    
    console.log('💾 API PUT: Final update fields:', Object.keys(updateFields));
    
    // Perform the update using the final query
    console.log('🔍 API PUT: Using query:', finalQuery);
    const result = await projectsCollection.updateOne(finalQuery, { $set: updateFields });
    
    console.log('📊 API PUT: MongoDB update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
    
    if (result.matchedCount === 0) {
      console.error('❌ API PUT: No project matched during update');
      return NextResponse.json(
        { 
          success: false,
          error: 'Project not found during update'
        },
        { status: 404 }
      );
    }
    
    console.log('✅ API PUT: Project updated successfully');
    
    // Get the updated project
    const updatedProject = await projectsCollection.findOne(finalQuery);
    const convertedProject = convertDocId(updatedProject);
    
    return NextResponse.json({ 
      success: true,
      message: 'Project updated successfully',
      project: convertedProject,
      modifiedCount: result.modifiedCount,
      queryMethod: queryMethod
    });
    
  } catch (error) {
    console.error('💥 API PUT: Error updating project:', error);
    
    let errorMessage = 'Failed to update project';
    if (error instanceof Error) {
      errorMessage = `Failed to update project: ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const projectsCollection = await getCollection('projects');
    
    try {
      const projectObjectId = await toObjectId(id);
      const result = await projectsCollection.deleteOne({ _id: projectObjectId });
      
      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (idError) {
      // Fallback to string ID
      const result = await projectsCollection.deleteOne({ id: id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Project deleted successfully'
      });
    }
    
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}