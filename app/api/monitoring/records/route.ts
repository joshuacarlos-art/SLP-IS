import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');
    
    console.log('Fetching monitoring records for project:', projectId);

    const collection = await getCollection('monitoring_records');
    
    // Build filter
    const filter: any = { is_archived: { $ne: true } };
    if (projectId) {
      filter.project_id = projectId;
    }

    const records = await collection
      .find(filter)
      .sort({ monitoring_date: -1 })
      .toArray();

    console.log(`Found ${records.length} records for project ${projectId}`);
    
    const convertedRecords = convertDocsIds(records);
    
    return NextResponse.json(convertedRecords);
  } catch (error) {
    console.error('Error fetching monitoring records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating monitoring record:', body);

    const collection = await getCollection('monitoring_records');
    
    // Get the selected association details
    const associationsCollection = await getCollection('associations');
    const selectedAssociationId = body.association_ids?.[0];
    
    let associationName = '';
    let associationLocation = '';
    
    if (selectedAssociationId) {
      const association = await associationsCollection.findOne({
        $or: [
          { id: selectedAssociationId },
          { _id: selectedAssociationId }
        ]
      });
      
      if (association) {
        associationName = association.name;
        associationLocation = association.location;
      }
    }

    const newRecord = {
      ...body,
      association_name: associationName,
      association_location: associationLocation,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await collection.insertOne(newRecord);
    console.log('Record created with ID:', result.insertedId);

    // Return the created record with the MongoDB ID
    const createdRecord = {
      id: result.insertedId.toString(),
      ...newRecord
    };

    return NextResponse.json(createdRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating monitoring record:', error);
    return NextResponse.json(
      { error: 'Failed to create monitoring record' },
      { status: 500 }
    );
  }
}