// app/api/performance/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const caretakersCollection = await getCollection('caretakers');
    const assessmentsCollection = await getCollection('assessments');

    // Get all caretakers
    const allCaretakers = await caretakersCollection.find({}).toArray();
    const allAssessments = await assessmentsCollection.find({}).toArray();

    // Calculate statistics
    const totalCaretakers = allCaretakers.length;
    const activeCaretakers = allCaretakers.filter(c => c.status === 'active').length;
    
    // Calculate performance distribution
    let totalScore = 0;
    let ratedCaretakers = 0;
    const performanceDistribution = {
      excellent: 0,
      good: 0,
      average: 0,
      needsImprovement: 0,
      noData: 0
    };

    allCaretakers.forEach(caretaker => {
      const caretakerId = caretaker.id || caretaker._id;
      const caretakerAssessments = allAssessments.filter(
        (a: any) => a.caretakerId === caretakerId
      );

      if (caretakerAssessments.length === 0) {
        performanceDistribution.noData++;
      } else {
        const averageRating = caretakerAssessments.reduce(
          (sum: number, a: any) => sum + a.rating, 
          0
        ) / caretakerAssessments.length;
        
        const score = averageRating * 20;
        totalScore += score;
        ratedCaretakers++;

        if (score >= 90) performanceDistribution.excellent++;
        else if (score >= 80) performanceDistribution.good++;
        else if (score >= 70) performanceDistribution.average++;
        else performanceDistribution.needsImprovement++;
      }
    });

    // FIXED: Changed 'ratedCareters' to 'ratedCaretakers'
    const averagePerformance = ratedCaretakers > 0 
      ? totalScore / ratedCaretakers
      : 0;

    const dashboardData = {
      totalCaretakers,
      activeCaretakers,
      averagePerformance: averagePerformance.toFixed(1),
      performanceDistribution,
      totalAssessments: allAssessments.length,
      topPerformersCount: performanceDistribution.excellent,
      needsImprovementCount: performanceDistribution.needsImprovement,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      {
        totalCaretakers: 0,
        activeCaretakers: 0,
        averagePerformance: 0,
        performanceDistribution: {
          excellent: 0,
          good: 0,
          average: 0,
          needsImprovement: 0,
          noData: 0
        },
        totalAssessments: 0,
        topPerformersCount: 0,
        needsImprovementCount: 0,
        lastUpdated: new Date().toISOString()
      },
      { status: 200 }
    );
  }
}