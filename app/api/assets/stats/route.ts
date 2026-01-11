import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching assets statistics...');
    
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    
    const collection = await getCollection('assets');
    
    // Build query
    let query: any = {};
    if (project_id) {
      query.project_id = project_id;
    }
    
    const [
      totalAssets,
      activeAssets,
      maintenanceAssets,
      disposedAssets,
      lostAssets,
      totalValue,
      assetsByType,
      assetsBySource
    ] = await Promise.all([
      collection.countDocuments(query),
      collection.countDocuments({ ...query, status: 'active' }),
      collection.countDocuments({ ...query, status: 'maintenance' }),
      collection.countDocuments({ ...query, status: 'disposed' }),
      collection.countDocuments({ ...query, status: 'lost' }),
      collection.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$total_value' } } }
      ]).toArray(),
      collection.aggregate([
        { $match: query },
        { $group: { _id: '$asset_type', count: { $sum: 1 }, value: { $sum: '$total_value' } } },
        { $project: { type: '$_id', count: 1, value: 1, _id: 0 } },
        { $sort: { value: -1 } }
      ]).toArray(),
      collection.aggregate([
        { $match: query },
        { $group: { _id: '$source_type', count: { $sum: 1 }, value: { $sum: '$total_value' } } },
        { $project: { source: '$_id', count: 1, value: 1, _id: 0 } },
        { $sort: { value: -1 } }
      ]).toArray()
    ]);

    const stats = {
      totalAssets,
      statusDistribution: {
        active: activeAssets,
        maintenance: maintenanceAssets,
        disposed: disposedAssets,
        lost: lostAssets
      },
      totalValue: totalValue[0]?.total || 0,
      assetsByType,
      assetsBySource,
      projectSpecific: project_id ? true : false
    };

    console.log('✅ Statistics fetched successfully');

    return NextResponse.json(stats);

  } catch (error: any) {
    console.error('❌ Error fetching asset statistics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics',
        message: error.message 
      },
      { status: 500 }
    );
  }
}