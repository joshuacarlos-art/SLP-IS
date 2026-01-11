import { NextRequest, NextResponse } from 'next/server';

// Mock data for projects related to financial records
const mockProjects = [
  {
    _id: 'project1',
    enterpriseSetup: {
      projectName: 'Rice Farming Enterprise',
      enterpriseType: 'Agriculture',
      status: 'active',
      startDate: '2024-01-01',
      region: 'Region I',
      province: 'La Union',
      cityMunicipality: 'San Fernando',
      barangay: 'Bangbangolan'
    },
    associationId: '1',
    operationalInformation: {
      multipleAssociations: [
        { id: '1', name: 'Farmers Cooperative of Region 1' }
      ]
    },
    financialInformation: {
      totalSales: 150000,
      netIncomeLoss: 50000,
      totalSavingsGenerated: 25000,
      cashOnHand: 15000,
      cashOnBank: 35000
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: 'project2',
    enterpriseSetup: {
      projectName: 'Fish Drying Business',
      enterpriseType: 'Fishery',
      status: 'active',
      startDate: '2024-01-15',
      region: 'Region I',
      province: 'Pangasinan',
      cityMunicipality: 'Dagupan',
      barangay: 'Pantal'
    },
    associationId: '2',
    operationalInformation: {
      multipleAssociations: [
        { id: '2', name: 'Coastal Fisherfolk Association' }
      ]
    },
    financialInformation: {
      totalSales: 80000,
      netIncomeLoss: 25000,
      totalSavingsGenerated: 15000,
      cashOnHand: 8000,
      cashOnBank: 17000
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    _id: 'project3',
    enterpriseSetup: {
      projectName: 'Handicraft Production',
      enterpriseType: 'Livelihood',
      status: 'active',
      startDate: '2024-02-01',
      region: 'Region I',
      province: 'Ilocos Sur',
      cityMunicipality: 'Vigan',
      barangay: 'Crisologo'
    },
    associationId: '3',
    operationalInformation: {
      multipleAssociations: [
        { id: '3', name: 'Women Entrepreneurs Association' }
      ]
    },
    financialInformation: {
      totalSales: 120000,
      netIncomeLoss: 40000,
      totalSavingsGenerated: 20000,
      cashOnHand: 12000,
      cashOnBank: 28000
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const associationId = searchParams.get('associationId');

    let projects = mockProjects;
    
    // Filter by association if provided
    if (associationId) {
      projects = projects.filter(project => 
        project.associationId === associationId ||
        project.operationalInformation?.multipleAssociations?.some((assoc: any) => assoc.id === associationId)
      );
    }
    
    // Filter archived projects if not included
    if (!includeArchived) {
      projects = projects.filter(project => project.enterpriseSetup.status !== 'archived');
    }

    return NextResponse.json({
      success: true,
      data: projects,
      total: projects.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch projects' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    
    // In a real application, you would save to database
    // For now, return the mock data with the new project
    const newProject = {
      _id: `project${mockProjects.length + 1}`,
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Project created successfully',
      data: newProject
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create project' 
      },
      { status: 500 }
    );
  }
}