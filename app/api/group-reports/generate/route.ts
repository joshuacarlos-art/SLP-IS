import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { associationId, period, year } = body;

    if (!associationId) {
      return NextResponse.json(
        { error: 'Association ID is required' },
        { status: 400 }
      );
    }

    const reportsCollection = await getCollection('financial_reports');
    const associationsCollection = await getCollection('associations');

    // Get association data
    const association = await associationsCollection.findOne({ _id: associationId });
    if (!association) {
      return NextResponse.json(
        { error: 'Association not found' },
        { status: 404 }
      );
    }

    // Check if report already exists for this period
    const existingReport = await reportsCollection.findOne({
      associationId,
      period: period || `Annual ${year || new Date().getFullYear()}`
    });

    if (existingReport) {
      return NextResponse.json({
        success: true,
        reportId: existingReport._id.toString(),
        message: 'Report already exists',
        existing: true
      });
    }

    // Generate report data based on association information
    const totalMembers = (association.no_active_members || 0) + (association.no_inactive_members || 0);
    const activeMembers = association.no_active_members || 0;
    
    // Generate realistic financial data based on association size and status
    const baseRevenue = totalMembers * 5000; // Base revenue per member
    const revenueVariation = 0.3; // ±30% variation
    
    const sales = Math.floor(baseRevenue * (1 + (Math.random() * revenueVariation * 2 - revenueVariation)));
    const costs = Math.floor(sales * (0.4 + Math.random() * 0.3)); // 40-70% costs
    const expenses = Math.floor(sales * (0.1 + Math.random() * 0.1)); // 10-20% expenses
    
    const profit = sales - costs;
    const share80 = profit * 0.8;
    const assShare20 = profit * 0.2;
    const monitoring2 = profit * 0.02;
    const balance = profit - expenses - monitoring2;

    const reportData = {
      associationId: association._id.toString(),
      associationName: association.name,
      period: period || `Annual ${year || new Date().getFullYear()}`,
      sales,
      costs,
      profit,
      share80,
      assShare20,
      monitoring2,
      expenses,
      balance,
      reportDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await reportsCollection.insertOne(reportData);

    return NextResponse.json({
      success: true,
      reportId: result.insertedId.toString(),
      message: 'Group report generated successfully',
      report: reportData
    });

  } catch (error) {
    console.error('Error generating group report:', error);
    return NextResponse.json(
      { error: 'Failed to generate group report' },
      { status: 500 }
    );
  }
}