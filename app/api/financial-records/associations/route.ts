import { NextRequest, NextResponse } from 'next/server';

// Mock data for associations related to financial records
const mockAssociations = [
  {
    _id: '1',
    name: 'Farmers Cooperative of Region 1',
    type: 'Agricultural',
    region: 'Region I',
    province: 'La Union',
    contactPerson: 'Juan Dela Cruz',
    contactNumber: '+63 912 345 6789',
    email: 'farmers.coop@example.com',
    totalMembers: 45,
    status: 'active',
    archived: false,
    financialStats: {
      totalProjects: 3,
      totalIncome: 350000,
      totalExpenses: 200000,
      netProfit: 150000,
      totalSavings: 60000
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    _id: '2',
    name: 'Coastal Fisherfolk Association',
    type: 'Fishery',
    region: 'Region I',
    province: 'Pangasinan',
    contactPerson: 'Maria Santos',
    contactNumber: '+63 917 654 3210',
    email: 'coastal.fisherfolk@example.com',
    totalMembers: 32,
    status: 'active',
    archived: false,
    financialStats: {
      totalProjects: 2,
      totalIncome: 180000,
      totalExpenses: 120000,
      netProfit: 60000,
      totalSavings: 30000
    },
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: '3',
    name: 'Women Entrepreneurs Association',
    type: 'Livelihood',
    region: 'Region I',
    province: 'Ilocos Sur',
    contactPerson: 'Ana Reyes',
    contactNumber: '+63 918 777 8888',
    email: 'women.entrepreneurs@example.com',
    totalMembers: 28,
    status: 'active',
    archived: false,
    financialStats: {
      totalProjects: 2,
      totalIncome: 220000,
      totalExpenses: 140000,
      netProfit: 80000,
      totalSavings: 40000
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    _id: '4',
    name: 'Organic Farmers Collective',
    type: 'Agricultural',
    region: 'Region I',
    province: 'La Union',
    contactPerson: 'Pedro Garcia',
    contactNumber: '+63 919 555 1234',
    email: 'organic.farmers@example.com',
    totalMembers: 38,
    status: 'active',
    archived: false,
    financialStats: {
      totalProjects: 1,
      totalIncome: 90000,
      totalExpenses: 60000,
      netProfit: 30000,
      totalSavings: 15000
    },
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const region = searchParams.get('region');
    const type = searchParams.get('type');

    let associations = mockAssociations;
    
    // Filter by region if provided
    if (region) {
      associations = associations.filter(assoc => assoc.region === region);
    }
    
    // Filter by type if provided
    if (type) {
      associations = associations.filter(assoc => assoc.type === type);
    }
    
    // Filter archived associations if not included
    if (!includeArchived) {
      associations = associations.filter(assoc => !assoc.archived);
    }

    return NextResponse.json({
      success: true,
      data: associations,
      total: associations.length,
      summary: {
        totalAssociations: associations.length,
        totalMembers: associations.reduce((sum, assoc) => sum + assoc.totalMembers, 0),
        totalIncome: associations.reduce((sum, assoc) => sum + assoc.financialStats.totalIncome, 0),
        totalNetProfit: associations.reduce((sum, assoc) => sum + assoc.financialStats.netProfit, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching associations:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch associations' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const associationData = await request.json();
    
    // In a real application, you would save to database
    // For now, return the mock data with the new association
    const newAssociation = {
      _id: `${mockAssociations.length + 1}`,
      ...associationData,
      financialStats: {
        totalProjects: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        totalSavings: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Association created successfully',
      data: newAssociation
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating association:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create association' 
      },
      { status: 500 }
    );
  }
}