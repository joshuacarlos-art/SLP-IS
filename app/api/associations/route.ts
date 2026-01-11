// app/api/associations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds, convertDocId } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🔍 Fetching associations from MongoDB...');
    const collection = await getCollection('associations');
    const associations = await collection.find({}).sort({ created_at: -1 }).toArray();
    
    console.log(`📊 Found ${associations.length} associations`);
    
    const convertedAssociations = convertDocsIds(associations);
    return NextResponse.json(convertedAssociations);
  } catch (error: any) {
    console.error('❌ Error fetching associations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch associations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating new association...');
    const collection = await getCollection('associations');
    const body = await request.json();
    
    console.log('📦 Received data:', body);
    
    const association = {
      // Basic information
      name: body.name,
      status: body.status || 'active',
      location: body.location || '',
      
      // Contact information
      contact_person: body.contact_person || '',
      contact_number: body.contact_number || '',
      email: body.email || '',
      
      // Dates
      date_formulated: body.date_formulated ? new Date(body.date_formulated) : new Date(),
      
      // Operational details
      operational_reason: body.operational_reason || '',
      no_active_members: body.no_active_members || 0,
      no_inactive_members: body.no_inactive_members || 0,
      
      // Financial features
      covid_affected: body.covid_affected || false,
      profit_sharing: body.profit_sharing || false,
      profit_sharing_amount: body.profit_sharing_amount || 0,
      loan_scheme: body.loan_scheme || false,
      loan_scheme_amount: body.loan_scheme_amount || 0,
      
      // Additional information
      registrations_certifications: body.registrations_certifications || [],
      final_org_adjectival_rating: body.final_org_adjectival_rating || '',
      final_org_rating_assessment: body.final_org_rating_assessment || '',
      
      // System fields
      archived: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    console.log('💾 Inserting association:', association);
    
    const result = await collection.insertOne(association);
    const newAssociation = await collection.findOne({ _id: result.insertedId });
    
    if (!newAssociation) {
      throw new Error('Failed to create association');
    }

    console.log('✅ Association created successfully:', newAssociation._id);
    
    return NextResponse.json(convertDocId(newAssociation));
  } catch (error: any) {
    console.error('❌ Error creating association:', error);
    return NextResponse.json(
      { error: 'Failed to create association: ' + error.message },
      { status: 500 }
    );
  }
}