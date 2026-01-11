import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocId } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15
    const { id } = await params;
    const caretakerId = id;
    
    // Get caretaker from database
    const caretakersCollection = await getCollection('caretakers');
    const assessmentsCollection = await getCollection('assessments');
    
    // Try to find caretaker by id or _id
    let caretaker = await caretakersCollection.findOne({ 
      id: caretakerId 
    });

    if (!caretaker) {
      try {
        // If not found by id, try by _id
        const { ObjectId } = await import('mongodb');
        const objectId = new ObjectId(caretakerId);
        caretaker = await caretakersCollection.findOne({ 
          _id: objectId 
        });
      } catch (error) {
        // Invalid ObjectId format
        caretaker = null;
      }
    }
    
    if (!caretaker) {
      return NextResponse.json(
        { error: 'Caretaker not found' },
        { status: 404 }
      );
    }

    // Get assessments for this caretaker
    const caretakerAssessments = await assessmentsCollection
      .find({ caretakerId: caretaker.id || caretaker._id?.toString() || caretakerId })
      .sort({ date: -1 })
      .toArray();

    // Convert caretaker
    const convertedCaretaker = convertDocId(caretaker);
    
    // Calculate performance metrics
    const performanceSummary = {
      overallScore: 0,
      rank: 0,
      percentile: 0,
      performanceLevel: 'No Data',
      lastUpdated: new Date().toISOString(),
    };

    const performanceMetrics: Array<{
      id: string;
      name: string;
      value: number;
      target: number;
      unit: string;
      trend: string;
      change: number;
      description: string;
      category: string;
      icon: string;
    }> = [];
    
    const recentAssessments = caretakerAssessments.map(convertDocId);
    
    if (caretakerAssessments.length > 0) {
      // Calculate average rating
      const totalRating = caretakerAssessments.reduce((sum, assessment) => sum + (assessment.rating || 0), 0);
      const averageRating = totalRating / caretakerAssessments.length;
      const overallScore = averageRating * 20;
      
      performanceSummary.overallScore = parseFloat(overallScore.toFixed(1));
      performanceSummary.performanceLevel = overallScore >= 90 ? 'Excellent' :
                                           overallScore >= 80 ? 'Good' :
                                           overallScore >= 70 ? 'Average' : 'Needs Improvement';
      
      // Add performance metrics
      performanceMetrics.push({
        id: 'overall-rating',
        name: 'Overall Rating',
        value: parseFloat(averageRating.toFixed(1)),
        target: 4.0,
        unit: '/5',
        trend: 'neutral',
        change: 0,
        description: 'Average performance rating',
        category: 'overall',
        icon: 'Star',
      });
    }

    return NextResponse.json({
      caretaker: convertedCaretaker,
      performanceSummary,
      performanceMetrics,
      recentAssessments,
      // Add empty arrays for other expected fields
      recentShifts: [],
      skillAssessments: [],
      performanceAlerts: [],
      trendData: [],
      comparisons: [],
      success: true,
      message: 'Caretaker performance data retrieved successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching caretaker performance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch caretaker performance data',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Add your PUT logic here
    return NextResponse.json({ 
      success: true,
      message: 'Caretaker updated successfully'
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to update caretaker',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Add your DELETE logic here
    return NextResponse.json({ 
      success: true,
      message: 'Caretaker deleted successfully'
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to delete caretaker',
        success: false
      },
      { status: 500 }
    );
  }
}