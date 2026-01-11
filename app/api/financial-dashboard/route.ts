import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    console.log('🔍 Fetching financial dashboard data...', { projectId, dateFrom, dateTo });

    const financialRecordsCollection = await getCollection('financial_records');

    // Build query
    let query: any = {};
    
    if (projectId && projectId !== '0') {
      query.project_id = parseInt(projectId);
    }
    
    if (dateFrom && dateTo) {
      query.record_date = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo)
      };
    }

    // Get financial records
    const records = await financialRecordsCollection.find(query).toArray();
    
    console.log(`📊 Found ${records.length} financial records`);

    // Calculate summary
    const summary = {
      total_income: 0,
      total_expense: 0,
      total_savings: 0,
      total_amount: 0,
      avg_amount: 0,
      min_amount: 0,
      max_amount: 0
    };

    const distribution: { record_type: string; total: number }[] = [];
    const typeTotals: { [key: string]: number } = {};

    if (records.length > 0) {
      records.forEach(record => {
        const amount = record.amount || 0;
        const recordType = record.record_type || 'unknown';

        // Update summary
        summary.total_amount += amount;
        
        if (recordType === 'income') summary.total_income += amount;
        if (recordType === 'expense') summary.total_expense += amount;
        if (recordType === 'savings') summary.total_savings += amount;

        // Update distribution
        typeTotals[recordType] = (typeTotals[recordType] || 0) + amount;
      });

      // Calculate averages
      summary.avg_amount = summary.total_amount / records.length;
      summary.min_amount = Math.min(...records.map(r => r.amount || 0));
      summary.max_amount = Math.max(...records.map(r => r.amount || 0));

      // Prepare distribution data
      Object.entries(typeTotals).forEach(([record_type, total]) => {
        distribution.push({ record_type, total });
      });
    }

    const result = {
      summary,
      distribution,
      record_count: records.length
    };

    console.log('✅ Financial dashboard data processed:', result);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Error fetching financial dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial dashboard data' },
      { status: 500 }
    );
  }
}