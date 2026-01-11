import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const associationId = searchParams.get('associationId');
    
    const collection = await getCollection('association_ratings');
    
    let query = {};
    if (associationId && associationId !== 'all') {
      query = { associationId: associationId };
    }

    const ratings = await collection.find(query).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json(convertDocsIds(ratings));
  } catch (error: any) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getCollection('association_ratings');
    
    // Validate required fields
    const requiredFields = ['associationId', 'associationName', 'ratingPeriod', 'overallRating', 'adjectivalRating'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const ratingData = {
      associationId: body.associationId,
      associationName: body.associationName,
      ratingPeriod: body.ratingPeriod,
      overallRating: parseFloat(body.overallRating),
      adjectivalRating: body.adjectivalRating,
      assessments: body.assessments || [],
      financialPerformance: parseFloat(body.financialPerformance) || 0,
      operationalEfficiency: parseFloat(body.operationalEfficiency) || 0,
      memberSatisfaction: parseFloat(body.memberSatisfaction) || 0,
      complianceScore: parseFloat(body.complianceScore) || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(ratingData);
    const newRating = await collection.findOne({ _id: result.insertedId });
    
    return NextResponse.json(convertDocsIds([newRating])[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { error: 'Failed to create rating: ' + error.message },
      { status: 500 }
    );
  }
}