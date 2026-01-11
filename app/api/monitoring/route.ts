import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds, convertDocId, toObjectId } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const field_officer_id = searchParams.get('field_officer_id');
    const status = searchParams.get('status');

    const collection = await getCollection('monitoring_records');
    
    const filter: any = { is_archived: { $ne: true } };
    
    if (project_id) {
      filter.project_id = project_id;
    }
    
    if (field_officer_id) {
      filter.field_officer_id = field_officer_id;
    }
    
    if (status) {
      filter.status = status;
    }

    const monitoringRecords = await collection
      .find(filter)
      .sort({ monitoring_date: -1 })
      .toArray();

    return NextResponse.json(convertDocsIds(monitoringRecords));

  } catch (error) {
    console.error('Error fetching monitoring records:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const requiredFields = ['project_id', 'monitoring_date', 'monitoring_year', 'field_officer_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const collection = await getCollection('monitoring_records');
    
    const monthly_gross_profit = (body.monthly_gross_sales || 0) - (body.monthly_cost_of_sales || 0);
    const monthly_net_income = monthly_gross_profit - (body.monthly_operating_expenses || 0);
    
    const monitoringRecord = {
      ...body,
      monthly_gross_profit,
      monthly_net_income,
      created_at: new Date(),
      updated_at: new Date(),
      is_archived: false
    };

    const result = await collection.insertOne(monitoringRecord);
    const createdRecord = await collection.findOne({ _id: result.insertedId });
    
    return NextResponse.json(convertDocId(createdRecord), { status: 201 });

  } catch (error) {
    console.error('Error creating monitoring record:', error);
    return NextResponse.json(
      { error: 'Failed to create monitoring record' },
      { status: 500 }
    );
  }
}