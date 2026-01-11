// app/api/performance/caretakers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const caretakersCollection = await getCollection('caretakers');
    const assessmentsCollection = await getCollection('assessments');

    // Get all caretakers
    const caretakers = await caretakersCollection.find({}).toArray();
    
    // Get all assessments
    const allAssessments = await assessmentsCollection.find({}).toArray();

    // Calculate performance for each caretaker
    const caretakersWithPerformance = await Promise.all(
      caretakers.map(async (caretaker: any) => {
        const caretakerId = caretaker.id || caretaker._id;
        const caretakerAssessments = allAssessments.filter(
          (assessment: any) => assessment.caretakerId === caretakerId
        );

        let performanceScore = 0;
        if (caretakerAssessments.length > 0) {
          const totalRating = caretakerAssessments.reduce(
            (sum: number, assessment: any) => sum + assessment.rating, 
            0
          );
          performanceScore = (totalRating / caretakerAssessments.length) * 20;
        }

        return {
          ...caretaker,
          performanceScore,
          totalAssessments: caretakerAssessments.length,
          lastAssessment: caretakerAssessments.length > 0 
            ? caretakerAssessments[0].date 
            : null
        };
      })
    );

    // Sort by performance score
    const sortedCaretakers = caretakersWithPerformance.sort(
      (a, b) => b.performanceScore - a.performanceScore
    );

    // Add rankings
    const rankedCaretakers = sortedCaretakers.map((caretaker, index) => ({
      ...caretaker,
      rank: index + 1
    }));

    return NextResponse.json(rankedCaretakers, { status: 200 });
  } catch (error) {
    console.error('Error fetching caretakers performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch caretakers performance data' },
      { status: 500 }
    );
  }
}