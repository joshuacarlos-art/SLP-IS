import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds, convertDocId } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🔍 Fetching financial reports from MongoDB...');
    const collection = await getCollection('financial_reports');
    
    const reports = await collection
      .find({})
      .sort({ reportDate: -1 })
      .toArray();
    
    // Convert MongoDB ObjectId to string
    const convertedReports = convertDocsIds(reports);
    
    console.log(`📊 Found ${convertedReports.length} financial reports`);
    
    return NextResponse.json(convertedReports);
  } catch (error: any) {
    console.error('❌ Error fetching financial reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial reports: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getCollection('financial_reports');
    
    console.log('📦 Creating financial report with data:', body);
    
    // Validate required fields
    const requiredFields = ['associationId', 'associationName', 'period', 'sales', 'costs', 'reportDate'];
    const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    const numericFields = ['sales', 'costs', 'expenses'];
    const invalidFields = numericFields.filter(field => {
      const value = body[field];
      return value !== undefined && value !== null && isNaN(parseFloat(value));
    });
    
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid numeric values in fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate financials
    const sales = parseFloat(body.sales) || 0;
    const costs = parseFloat(body.costs) || 0;
    const expenses = parseFloat(body.expenses) || 0;
    
    const profit = sales - costs;
    const share80 = profit * 0.8;
    const assShare20 = profit * 0.2;
    const monitoring2 = profit * 0.02;
    const balance = profit - expenses - monitoring2;

    const reportData = {
      associationId: body.associationId,
      associationName: body.associationName,
      period: body.period,
      sales: sales,
      costs: costs,
      profit: profit,
      share80: share80,
      assShare20: assShare20,
      monitoring2: monitoring2,
      expenses: expenses,
      balance: balance,
      reportDate: new Date(body.reportDate),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 Inserting financial report:', reportData);
    
    const result = await collection.insertOne(reportData);
    
    // Fetch the created report and convert ObjectId
    const newReport = await collection.findOne({ _id: result.insertedId });
    
    if (!newReport) {
      throw new Error('Failed to create financial report');
    }
    
    const convertedReport = convertDocId(newReport);
    console.log('✅ Financial report created successfully');
    
    return NextResponse.json(convertedReport, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating financial report:', error);
    return NextResponse.json(
      { error: 'Failed to create financial report: ' + error.message },
      { status: 500 }
    );
  }
}

// =============================================================================
// ADDITIONAL HTTP METHODS FOR COMPLETE CRUD
// =============================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection('financial_reports');
    const { ObjectId } = await import('mongodb');
    
    // Validate if report exists
    const existingReport = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingReport) {
      return NextResponse.json(
        { error: 'Financial report not found' },
        { status: 404 }
      );
    }

    // Calculate updated financials if sales, costs, or expenses are being updated
    let updateData: any = {
      ...body,
      updatedAt: new Date()
    };

    if (body.sales !== undefined || body.costs !== undefined || body.expenses !== undefined) {
      const sales = parseFloat(body.sales !== undefined ? body.sales : existingReport.sales) || 0;
      const costs = parseFloat(body.costs !== undefined ? body.costs : existingReport.costs) || 0;
      const expenses = parseFloat(body.expenses !== undefined ? body.expenses : existingReport.expenses) || 0;
      
      const profit = sales - costs;
      const share80 = profit * 0.8;
      const assShare20 = profit * 0.2;
      const monitoring2 = profit * 0.02;
      const balance = profit - expenses - monitoring2;

      updateData = {
        ...updateData,
        sales,
        costs,
        expenses,
        profit,
        share80,
        assShare20,
        monitoring2,
        balance
      };
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Financial report not found' },
        { status: 404 }
      );
    }

    // Fetch the updated report
    const updatedReport = await collection.findOne({ _id: new ObjectId(id) });
    const convertedReport = convertDocId(updatedReport);

    console.log('✅ Financial report updated successfully');
    return NextResponse.json(convertedReport);
  } catch (error: any) {
    console.error('❌ Error updating financial report:', error);
    return NextResponse.json(
      { error: 'Failed to update financial report: ' + error.message },
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
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection('financial_reports');
    const { ObjectId } = await import('mongodb');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Financial report not found' },
        { status: 404 }
      );
    }

    console.log('✅ Financial report deleted successfully');
    return NextResponse.json({ message: 'Financial report deleted successfully' });
  } catch (error: any) {
    console.error('❌ Error deleting financial report:', error);
    return NextResponse.json(
      { error: 'Failed to delete financial report: ' + error.message },
      { status: 500 }
    );
  }
}