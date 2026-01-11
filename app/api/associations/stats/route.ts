import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const collection = await getCollection('associations');
    
    // Get total associations (excluding archived)
    const totalAssociations = await collection.countDocuments({ 
      status: { $ne: 'archived' } 
    });
    
    // Get total active members across all associations
    const associations = await collection.find({ 
      status: { $ne: 'archived' } 
    }).toArray();
    
    const totalMembers = associations.reduce((sum, association) => {
      return sum + (association.activeMembers || 0);
    }, 0);
    
    // Calculate growth rate (you can modify this based on your needs)
    // For now, we'll use a placeholder or calculate based on createdAt dates
    const lastMonthAssociations = await collection.countDocuments({
      status: { $ne: 'archived' },
      createdAt: { 
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
      }
    });
    
    const growthRate = totalAssociations > 0 
      ? Math.round((lastMonthAssociations / totalAssociations) * 100)
      : 0;

    const stats = {
      totalAssociations,
      totalMembers,
      totalPigs: 0, // You can add pig data if you have it
      growthRate
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching association stats:', error);
    return NextResponse.json(
      { 
        totalAssociations: 0,
        totalMembers: 0,
        totalPigs: 0,
        growthRate: 0
      },
      { status: 500 }
    );
  }
}