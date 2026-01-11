import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching institutional buyers statistics...');
    
    const collection = await getCollection('institutional_buyers');
    
    const [
      totalBuyers,
      activeBuyers,
      inactiveBuyers,
      buyersByType
    ] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ status: 'active' }),
      collection.countDocuments({ status: 'inactive' }),
      collection.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            type: '$_id',
            count: 1,
            _id: 0
          }
        },
        {
          $sort: { count: -1 }
        }
      ]).toArray()
    ]);

    const stats = {
      totalBuyers,
      activeBuyers,
      inactiveBuyers,
      buyersByType
    };

    console.log('✅ Statistics fetched successfully');

    return NextResponse.json(stats);

  } catch (error: any) {
    console.error('❌ Error fetching buyer statistics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics',
        message: error.message 
      },
      { status: 500 }
    );
  }
}