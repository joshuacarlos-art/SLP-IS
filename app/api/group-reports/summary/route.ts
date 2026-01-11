import { NextRequest, NextResponse } from 'next/server';
import { getCollection, convertDocsIds } from '@/lib/mongodb';

interface FinancialReport {
  _id: string;
  associationId: string;
  associationName: string;
  period: string;
  sales: number;
  costs: number;
  profit: number;
  share80: number;
  assShare20: number;
  monitoring2: number;
  expenses: number;
  balance: number;
  reportDate: Date;
  caretakerId?: string;
  caretakerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Association {
  _id: string;
  name: string;
  status: string;
  location: string;
  no_active_members?: number;
  no_inactive_members?: number;
  sustainabilityScore?: number;
  complianceRate?: number;
}

interface ReportSummary {
  associationId: string;
  associationName: string;
  location: string;
  status: string;
  totalMembers: number;
  activeMembers: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  sustainabilityScore: number;
  complianceRate: number;
  lastReportDate: string | null;
  reportPeriod: string;
}

interface PerformanceMetrics {
  financialHealth: number;
  membershipEngagement: number;
  operationalEfficiency: number;
  complianceScore: number;
  weightedAverage: number;
  plusFactor: number;
  overallRating: number;
  descriptiveRating: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    const reportsCollection = await getCollection('financial_reports');
    const associationsCollection = await getCollection('associations');

    // Get date range for the year
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    // Get all reports for the year
    const reports = await reportsCollection
      .find({
        reportDate: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ reportDate: -1 })
      .toArray();

    const convertedReports = convertDocsIds(reports) as FinancialReport[];

    // Get all associations
    const associations = await associationsCollection
      .find({})
      .toArray();

    const convertedAssociations = convertDocsIds(associations) as Association[];

    // Calculate summary statistics
    const totalSales = convertedReports.reduce((sum: number, report: FinancialReport) => sum + report.sales, 0);
    const totalProfit = convertedReports.reduce((sum: number, report: FinancialReport) => sum + report.profit, 0);
    const totalBalance = convertedReports.reduce((sum: number, report: FinancialReport) => sum + report.balance, 0);
    const totalAssShare = convertedReports.reduce((sum: number, report: FinancialReport) => sum + report.assShare20, 0);

    // Group reports by association
    const reportsByAssociation: { [key: string]: FinancialReport[] } = convertedReports.reduce((acc: { [key: string]: FinancialReport[] }, report: FinancialReport) => {
      if (!acc[report.associationId]) {
        acc[report.associationId] = [];
      }
      acc[report.associationId].push(report);
      return acc;
    }, {});

    // Calculate performance metrics for each association
    const performanceMetrics: { [key: string]: PerformanceMetrics } = {};

    Object.entries(reportsByAssociation).forEach(([associationId, assReports]) => {
      const association = convertedAssociations.find(a => a._id === associationId);
      if (!association) return;

      const totalMembers = (association.no_active_members || 0) + (association.no_inactive_members || 0);
      const activeMembers = association.no_active_members || 0;
      
      const totalRevenue = assReports.reduce((sum: number, report: FinancialReport) => sum + report.sales, 0);
      const totalExpenses = assReports.reduce((sum: number, report: FinancialReport) => sum + (report.costs + report.expenses), 0);
      const netProfit = totalRevenue - totalExpenses;

      // Calculate performance metrics
      const financialHealth = 1 + (netProfit >= 0 ? (Math.min(netProfit / 50000, 1) * 4) : 0);
      const membershipEngagement = totalMembers > 0 
        ? 1 + ((activeMembers / totalMembers) * 4)
        : 1;
      const operationalEfficiency = 1 + ((association.sustainabilityScore || 70) / 100 * 4);
      const complianceScore = 1 + ((association.complianceRate || 80) / 100 * 4);

      const weightedAverage = (
        financialHealth * 0.3 + 
        membershipEngagement * 0.3 + 
        operationalEfficiency * 0.2 + 
        complianceScore * 0.2
      );

      const plusFactor = 0;
      const overallRating = weightedAverage + plusFactor;

      const getDescriptiveRating = (rating: number) => {
        if (rating >= 4.5) return "Outstanding";
        if (rating >= 4.0) return "Very Satisfactory";
        if (rating >= 3.5) return "Satisfactory";
        if (rating >= 3.0) return "Fair";
        return "Needs Improvement";
      };

      performanceMetrics[associationId] = {
        financialHealth: parseFloat(Math.max(1, Math.min(5, financialHealth)).toFixed(2)),
        membershipEngagement: parseFloat(Math.max(1, Math.min(5, membershipEngagement)).toFixed(2)),
        operationalEfficiency: parseFloat(Math.max(1, Math.min(5, operationalEfficiency)).toFixed(2)),
        complianceScore: parseFloat(Math.max(1, Math.min(5, complianceScore)).toFixed(2)),
        weightedAverage: parseFloat(Math.max(1, Math.min(5, weightedAverage)).toFixed(2)),
        plusFactor,
        overallRating: parseFloat(Math.max(1, Math.min(5, overallRating)).toFixed(2)),
        descriptiveRating: getDescriptiveRating(overallRating)
      };
    });

    // Generate report summaries
    const reportSummaries: ReportSummary[] = convertedAssociations.map((association: Association) => {
      const associationReports = reportsByAssociation[association._id] || [];
      const metrics = performanceMetrics[association._id] || {
        financialHealth: 0,
        membershipEngagement: 0,
        operationalEfficiency: 0,
        complianceScore: 0,
        weightedAverage: 0,
        plusFactor: 0,
        overallRating: 0,
        descriptiveRating: "No Data"
      };

      const latestReport = associationReports[0] || null;

      return {
        associationId: association._id,
        associationName: association.name,
        location: association.location,
        status: association.status,
        totalMembers: (association.no_active_members || 0) + (association.no_inactive_members || 0),
        activeMembers: association.no_active_members || 0,
        totalRevenue: associationReports.reduce((sum: number, report: FinancialReport) => sum + report.sales, 0),
        totalExpenses: associationReports.reduce((sum: number, report: FinancialReport) => sum + (report.costs + report.expenses), 0),
        netProfit: associationReports.reduce((sum: number, report: FinancialReport) => sum + report.profit, 0),
        sustainabilityScore: association.sustainabilityScore || 0,
        complianceRate: association.complianceRate || 0,
        lastReportDate: latestReport ? latestReport.reportDate.toString() : null,
        reportPeriod: latestReport ? latestReport.period : 'No Reports',
        performanceMetrics: metrics
      };
    });

    const summary = {
      totalAssociations: convertedAssociations.length,
      associationsWithReports: Object.keys(reportsByAssociation).length,
      totalReports: convertedReports.length,
      totalSales,
      totalProfit,
      totalBalance,
      totalAssShare,
      reportYear: year,
      generatedAt: new Date().toISOString(),
      reportSummaries,
      performanceMetrics
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error generating group reports summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate group reports summary' },
      { status: 500 }
    );
  }
}