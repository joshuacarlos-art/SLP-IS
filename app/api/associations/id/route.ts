// app/api/associations/id/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection, toObjectId, convertDocId } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('🔍 Fetching association with ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Association ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection('associations');
    const objectId = await toObjectId(id);
    const association = await collection.findOne({ _id: objectId });
    
    if (!association) {
      return NextResponse.json(
        { error: 'Association not found' },
        { status: 404 }
      );
    }

    console.log('✅ Association found:', association.name);
    return NextResponse.json(convertDocId(association));
  } catch (error: any) {
    console.error('❌ Error fetching association:', error);
    return NextResponse.json(
      { error: 'Failed to fetch association: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    console.log('🔄 Updating association with ID:', id);
    console.log('📦 Update data:', body);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Association ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection('associations');
    const objectId = await toObjectId(id);
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date()
    };

    // Add only the fields that are provided
    const allowedFields = [
      'name', 'status', 'location', 'contact_person', 'contact_number', 'email',
      'date_formulated', 'operational_reason', 'no_active_members', 'no_inactive_members',
      'covid_affected', 'profit_sharing', 'profit_sharing_amount', 'loan_scheme',
      'loan_scheme_amount', 'registrations_certifications', 'final_org_adjectival_rating',
      'final_org_rating_assessment', 'archived'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Handle date conversion
    if (body.date_formulated) {
      updateData.date_formulated = new Date(body.date_formulated);
    }

    console.log('💾 Update payload:', updateData);

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    console.log('📊 Update result:', result);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Association not found' },
        { status: 404 }
      );
    }

    const updatedAssociation = await collection.findOne({ _id: objectId });
    
    if (!updatedAssociation) {
      throw new Error('Failed to fetch updated association');
    }

    console.log('✅ Association updated successfully');
    return NextResponse.json(convertDocId(updatedAssociation));
  } catch (error: any) {
    console.error('❌ Error updating association:', error);
    return NextResponse.json(
      { error: 'Failed to update association: ' + error.message },
      { status: 500 }
    );
  }
}