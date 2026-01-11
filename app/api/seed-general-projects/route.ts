import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function POST() {
  try {
    console.log('Seeding general projects data...');
    
    const projectsCollection = await getCollection('general_projects');

    const sampleProjects = [
      {
        project_id: "PROJ-001",
        participant_name: "Juan Dela Cruz",
        barangay: "Barangay 1",
        city_municipality: "Manila",
        province: "Metro Manila",
        enterprise_type: "Agriculture",
        association_name: "Farmers Association",
        monitoring_date: new Date().toISOString().split('T')[0],
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        project_id: "PROJ-002",
        participant_name: "Maria Santos",
        barangay: "Barangay 2",
        city_municipality: "Quezon City",
        province: "Metro Manila",
        enterprise_type: "Retail",
        association_name: "Women Entrepreneurs",
        monitoring_date: new Date().toISOString().split('T')[0],
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        project_id: "PROJ-003",
        participant_name: "Pedro Reyes",
        barangay: "Barangay 3",
        city_municipality: "Makati",
        province: "Metro Manila",
        enterprise_type: "Food Processing",
        association_name: "Food Producers Coop",
        monitoring_date: new Date().toISOString().split('T')[0],
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Clear existing data (optional - remove this line if you want to keep existing data)
    // await projectsCollection.deleteMany({});

    // Insert sample data
    const result = await projectsCollection.insertMany(sampleProjects);

    console.log(`Inserted ${result.insertedCount} sample projects`);

    return NextResponse.json({
      success: true,
      message: 'Sample projects added successfully',
      insertedCount: result.insertedCount,
      projects: sampleProjects
    });
  } catch (error: any) {
    console.error('Error seeding projects:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to add sample projects'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const projectsCollection = await getCollection('general_projects');
    const count = await projectsCollection.countDocuments();
    
    return NextResponse.json({
      collection: 'general_projects',
      documentCount: count
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}