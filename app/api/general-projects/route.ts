import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get('stats') === 'true';

    console.log('🔍 Fetching general projects from MongoDB...');
    
    const collection = await getCollection('general_projects');
    
    if (statsOnly) {
      // Return statistics
      const totalProjects = await collection.countDocuments();
      const projects = await collection.find({}).toArray();
      
      // Calculate stats
      const uniqueAssociations = new Set(projects.map(p => p.association_name)).size;
      const activeProjects = projects.filter(p => p.project_status === 'ongoing').length;
      const completedProjects = projects.filter(p => p.project_status === 'completed').length;
      const totalBudget = projects.reduce((sum, p) => sum + (p.budget_allocation || 0), 0);
      
      // Projects by status
      const projectsByStatus = {
        planning: projects.filter(p => p.project_status === 'planning').length,
        ongoing: projects.filter(p => p.project_status === 'ongoing').length,
        completed: projects.filter(p => p.project_status === 'completed').length,
        cancelled: projects.filter(p => p.project_status === 'cancelled').length,
      };
      
      // Projects by barangay
      const barangayCounts: Record<string, number> = {};
      projects.forEach(project => {
        if (project.barangay) {
          barangayCounts[project.barangay] = (barangayCounts[project.barangay] || 0) + 1;
        }
      });
      
      const projectsByBarangay = Object.entries(barangayCounts).map(([barangay, count]) => ({
        barangay,
        count
      }));

      const stats = {
        totalProjects,
        totalAssociations: uniqueAssociations,
        activeProjects,
        completedProjects,
        totalBudget,
        projectsThisMonth: 0, // You can implement this later
        projectsByStatus,
        projectsByBarangay
      };

      console.log('📊 Stats calculated:', stats);
      return NextResponse.json(stats);
    } else {
      // Return projects list
      const projects = await collection.find({}).sort({ createdAt: -1 }).toArray();
      const convertedProjects = convertDocsIds(projects);
      console.log('📋 Projects fetched:', convertedProjects.length);
      return NextResponse.json(convertedProjects);
    }

  } catch (error: any) {
    console.error('❌ Error in general-projects API:', error);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        message: error.message,
        details: 'Check if MongoDB is connected and general_projects collection exists'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    console.log('🔄 Creating new project:', projectData);

    const collection = await getCollection('general_projects');

    // Validate required fields
    const requiredFields = ['project_name', 'participant_name', 'barangay', 'city_municipality', 'province', 'enterprise_type', 'association_name'];
    const missingFields = requiredFields.filter(field => !projectData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate unique project ID
    const projectId = `PROJ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const finalProjectData = {
      ...projectData,
      project_id: projectId,
      monitoring_date: projectData.monitoring_date || new Date().toISOString().split('T')[0],
      budget_allocation: projectData.budget_allocation || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(finalProjectData);
    
    console.log('✅ Project created successfully:', result.insertedId);

    return NextResponse.json({ 
      success: true, 
      projectId: projectId,
      insertedId: result.insertedId 
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating project:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create project',
        message: error.message 
      },
      { status: 500 }
    );
  }
}