import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const associationId = searchParams.get('associationId');
    const period = searchParams.get('period');
    const year = searchParams.get('year');

    const reportsCollection = await getCollection('financial_reports');
    
    let query = {};
    
    // Build query based on parameters
    if (associationId) {
      query = { ...query, associationId };
    }
    
    if (period) {
      query = { ...query, period };
    }
    
    if (year) {
      query = { 
        ...query, 
        reportDate: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      };
    }

    const reports = await reportsCollection
      .find(query)
      .sort({ reportDate: -1 })
      .toArray();

    const convertedReports = convertDocsIds(reports);

    return NextResponse.json(convertedReports);
  } catch (error) {
    console.error('Error fetching group reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      associationId,
      associationName,
      period,
      sales,
      costs,
      expenses,
      reportDate,
      caretakerId,
      caretakerName
    } = body;

    // Validate required fields
    if (!associationId || !associationName || !period || !reportDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reportsCollection = await getCollection('financial_reports');

    // Calculate financials
    const profit = (sales || 0) - (costs || 0);
    const share80 = profit * 0.8;
    const assShare20 = profit * 0.2;
    const monitoring2 = profit * 0.02;
    const balance = profit - (expenses || 0) - monitoring2;

    const reportData = {
      associationId,
      associationName,
      period,
      sales: sales || 0,
      costs: costs || 0,
      profit,
      share80,
      assShare20,
      monitoring2,
      expenses: expenses || 0,
      balance,
      reportDate: new Date(reportDate),
      caretakerId: caretakerId || null,
      caretakerName: caretakerName || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await reportsCollection.insertOne(reportData);

    return NextResponse.json({
      success: true,
      reportId: result.insertedId.toString(),
      message: 'Group report created successfully'
    });

  } catch (error) {
    console.error('Error creating group report:', error);
    return NextResponse.json(
      { error: 'Failed to create group report' },
      { status: 500 }
    );
  }
}