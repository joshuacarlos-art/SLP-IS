import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

export async function GET() {
  try {
    const financialReportsCollection = await getCollection('financial_reports');
    const associationsCollection = await getCollection('associations');
    const ratingsCollection = await getCollection('association_ratings');

    // Get all data
    const [reports, associations, ratings] = await Promise.all([
      financialReportsCollection.find({}).toArray(),
      associationsCollection.find({}).toArray(),
      ratingsCollection.find({}).sort({ createdAt: -1 }).limit(5).toArray()
    ]);

    const convertedReports = convertDocsIds(reports);
    const convertedAssociations = convertDocsIds(associations);
    const convertedRatings = convertDocsIds(ratings);

    // Calculate financial summary
    const totalSales = convertedReports.reduce((sum, report) => sum + report.sales, 0);
    const totalProfit = convertedReports.reduce((sum, report) => sum + report.profit, 0);
    const totalBalance = convertedReports.reduce((sum, report) => sum + report.balance, 0);
    const totalAssociations = convertedAssociations.length;
    const totalReports = convertedReports.length;
    const averageProfitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    // Calculate top performing associations
    const associationPerformance = convertedAssociations.map(association => {
      const associationReports = convertedReports.filter(report => report.associationId === association._id);
      const totalProfit = associationReports.reduce((sum, report) => sum + report.profit, 0);
      const totalBalance = associationReports.reduce((sum, report) => sum + report.balance, 0);
      
      return {
        name: association.name,
        profit: totalProfit,
        balance: totalBalance
      };
    }).sort((a, b) => b.profit - a.profit).slice(0, 3);

    // Calculate performance trends (last 4 quarters)
    const currentDate = new Date();
    const performanceTrends = [];
    
    for (let i = 3; i >= 0; i--) {
      const quarterDate = new Date(currentDate);
      quarterDate.setMonth(quarterDate.getMonth() - (i * 3));
      const quarter = `Q${Math.floor(quarterDate.getMonth() / 3) + 1}-${quarterDate.getFullYear()}`;
      
      const quarterReports = convertedReports.filter(report => 
        report.period.includes(quarter) || 
        new Date(report.reportDate).getMonth() === quarterDate.getMonth()
      );
      
      const quarterSales = quarterReports.reduce((sum, report) => sum + report.sales, 0);
      const quarterProfit = quarterReports.reduce((sum, report) => sum + report.profit, 0);
      const quarterBalance = quarterReports.reduce((sum, report) => sum + report.balance, 0);
      
      performanceTrends.push({
        period: quarter,
        sales: quarterSales,
        profit: quarterProfit,
        balance: quarterBalance
      });
    }

    const stats = {
      financialSummary: {
        totalSales,
        totalProfit,
        totalBalance,
        totalAssociations,
        totalReports,
        averageProfitMargin,
        topPerformingAssociations: associationPerformance,
        recentReports: convertedReports.slice(0, 5)
      },
      recentRatings: convertedRatings,
      performanceTrends
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats: ' + error.message },
      { status: 500 }
    );
  }
}