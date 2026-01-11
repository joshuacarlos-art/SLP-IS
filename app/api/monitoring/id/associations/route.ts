// app/api/monitoring/id/associations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds, toObjectId } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // For static route, get ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection('projects');
    
    let project;
    try {
      project = await collection.findOne({ _id: await toObjectId(id) });
    } catch {
      project = await collection.findOne({ id: id });
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Return associations from the project
    const associations = project.operationalInformation?.multipleAssociations || [];
    return NextResponse.json(convertDocsIds(associations));

  } catch (error) {
    console.error('Error fetching project associations:', error);
    
    // Fallback mock data
    const mockAssociations = [
      { 
        id: '1', 
        name: 'Farmers Association 1', 
        location: 'sitio tabugon brgy caradio-an himamaylan city, Negros Occidental', 
        no_active_members: 25, 
        region: 'Region VI', 
        province: 'Negros Occidental' 
      }
    ];
    
    return NextResponse.json(mockAssociations);
  }
}