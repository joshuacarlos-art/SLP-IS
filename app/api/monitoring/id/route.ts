// app/api/monitoring/id/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocId, toObjectId } from '@/lib/mongodb';

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
    
    const collection = await getCollection('monitoring_records');
    
    let record;
    try {
      record = await collection.findOne({ _id: await toObjectId(id) });
    } catch {
      record = await collection.findOne({ id: id });
    }

    if (!record) {
      return NextResponse.json(
        { error: 'Monitoring record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(convertDocId(record));

  } catch (error) {
    console.error('Error fetching monitoring record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring record' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const collection = await getCollection('monitoring_records');
    
    if (body.monthly_gross_sales !== undefined || body.monthly_cost_of_sales !== undefined || body.monthly_operating_expenses !== undefined) {
      const existingRecord = await collection.findOne({ _id: await toObjectId(id) });
      if (existingRecord) {
        const grossSales = body.monthly_gross_sales ?? existingRecord.monthly_gross_sales;
        const costOfSales = body.monthly_cost_of_sales ?? existingRecord.monthly_cost_of_sales;
        const operatingExpenses = body.monthly_operating_expenses ?? existingRecord.monthly_operating_expenses;
        
        body.monthly_gross_profit = grossSales - costOfSales;
        body.monthly_net_income = body.monthly_gross_profit - operatingExpenses;
      }
    }

    const updateData = {
      ...body,
      updated_at: new Date()
    };

    let result;
    try {
      result = await collection.updateOne(
        { _id: await toObjectId(id) },
        { $set: updateData }
      );
    } catch {
      result = await collection.updateOne(
        { id: id },
        { $set: updateData }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Monitoring record not found' },
        { status: 404 }
      );
    }

    let updatedRecord;
    try {
      updatedRecord = await collection.findOne({ _id: await toObjectId(id) });
    } catch {
      updatedRecord = await collection.findOne({ id: id });
    }

    return NextResponse.json(convertDocId(updatedRecord));

  } catch (error) {
    console.error('Error updating monitoring record:', error);
    return NextResponse.json(
      { error: 'Failed to update monitoring record' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection('monitoring_records');
    
    let result;
    try {
      result = await collection.updateOne(
        { _id: await toObjectId(id) },
        { $set: { is_archived: true, updated_at: new Date() } }
      );
    } catch {
      result = await collection.updateOne(
        { id: id },
        { $set: { is_archived: true, updated_at: new Date() } }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Monitoring record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Monitoring record archived successfully' });

  } catch (error) {
    console.error('Error archiving monitoring record:', error);
    return NextResponse.json(
      { error: 'Failed to archive monitoring record' },
      { status: 500 }
    );
  }
}