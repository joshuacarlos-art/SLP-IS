import { getCollection } from '@/lib/mongodb';

export class PerformanceDashboardService {
  
  // Get yearly performance metrics
  static async getYearlyPerformance(year: number): Promise<any> {
    const collection = await getCollection('pig_performance');
    
    // Calculate start and end dates for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Get all performance records for the year
    const records = await collection
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .toArray();

    // Group by month and calculate metrics
    const monthlyData = this.calculateMonthlyMetrics(records, year);
    
    // Calculate overall metrics
    const totalPigs = await this.getTotalPigsTracked(year);
    const averageWeightGain = this.calculateAverageWeightGain(records);
    const mortalityRate = await this.calculateMortalityRate(year);
    const feedConversionRatio = this.calculateAverageFeedConversion(records);
    const averageHealthScore = this.calculateAverageHealthScore(records);

    return {
      year,
      totalPigs,
      averageWeightGain,
      mortalityRate,
      feedConversionRatio,
      averageHealthScore,
      monthlyData
    };
  }

  // Get health status distribution
  static async getHealthStatusDistribution(year: number): Promise<any> {
    const collection = await getCollection('pig_performance');
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const records = await collection
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .toArray();

    const distribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      critical: 0
    };

    records.forEach((record: any) => {
      const healthScore = record.healthScore;
      if (healthScore >= 9) distribution.excellent++;
      else if (healthScore >= 7) distribution.good++;
      else if (healthScore >= 5) distribution.fair++;
      else if (healthScore >= 3) distribution.poor++;
      else distribution.critical++;
    });

    return distribution;
  }

  // Get performance insights
  static async getPerformanceInsights(year: number): Promise<any[]> {
    const metrics = await this.getYearlyPerformance(year);
    const insights: any[] = [];

    // Weight gain insight
    if (metrics.averageWeightGain > 0.8) {
      insights.push({
        type: 'positive',
        title: 'Excellent Weight Gain',
        description: 'Pigs are showing above average weight gain performance',
        metric: 'Avg Weight Gain',
        value: metrics.averageWeightGain,
        trend: 'up'
      });
    } else if (metrics.averageWeightGain < 0.4) {
      insights.push({
        type: 'warning',
        title: 'Low Weight Gain',
        description: 'Consider reviewing feeding strategies and health protocols',
        metric: 'Avg Weight Gain',
        value: metrics.averageWeightGain,
        trend: 'down'
      });
    }

    // Mortality insight
    if (metrics.mortalityRate > 5) {
      insights.push({
        type: 'negative',
        title: 'High Mortality Rate',
        description: 'Mortality rate is above acceptable levels. Review health management',
        metric: 'Mortality Rate',
        value: metrics.mortalityRate,
        trend: 'up'
      });
    } else if (metrics.mortalityRate < 1) {
      insights.push({
        type: 'positive',
        title: 'Low Mortality Rate',
        description: 'Excellent health management with minimal losses',
        metric: 'Mortality Rate',
        value: metrics.mortalityRate,
        trend: 'down'
      });
    }

    // Feed conversion insight
    if (metrics.feedConversionRatio < 2.5) {
      insights.push({
        type: 'positive',
        title: 'Efficient Feed Conversion',
        description: 'Pigs are converting feed to weight efficiently',
        metric: 'Feed Conversion Ratio',
        value: metrics.feedConversionRatio,
        trend: 'down'
      });
    } else if (metrics.feedConversionRatio > 3.5) {
      insights.push({
        type: 'warning',
        title: 'Poor Feed Efficiency',
        description: 'Feed conversion ratio is higher than optimal',
        metric: 'Feed Conversion Ratio',
        value: metrics.feedConversionRatio,
        trend: 'up'
      });
    }

    // Health score insight
    if (metrics.averageHealthScore >= 7) {
      insights.push({
        type: 'positive',
        title: 'Good Health Status',
        description: 'Overall herd health is maintaining good levels',
        metric: 'Health Score',
        value: metrics.averageHealthScore,
        trend: 'stable'
      });
    }

    return insights;
  }

  // Private helper methods
  private static calculateMonthlyMetrics(records: any[], year: number): any[] {
    const monthlyData: any[] = [];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (let month = 0; month < 12; month++) {
      const monthRecords = records.filter((record: any) => 
        record.date.getMonth() === month && record.date.getFullYear() === year
      );

      if (monthRecords.length > 0) {
        const avgWeight = monthRecords.reduce((sum: number, record: any) => sum + record.weight, 0) / monthRecords.length;
        const avgWeightGain = monthRecords.reduce((sum: number, record: any) => sum + (record.weightGain || 0), 0) / monthRecords.length;
        const avgFCR = monthRecords.reduce((sum: number, record: any) => sum + (record.feedConversionRatio || 0), 0) / monthRecords.length;
        const avgHealth = monthRecords.reduce((sum: number, record: any) => sum + record.healthScore, 0) / monthRecords.length;

        monthlyData.push({
          month: months[month],
          monthNumber: month + 1,
          averageWeight: Number(avgWeight.toFixed(2)),
          weightGain: Number(avgWeightGain.toFixed(3)),
          feedConversionRatio: Number(avgFCR.toFixed(2)),
          mortalityCount: 0,
          totalPigs: new Set(monthRecords.map((r: any) => r.pigId)).size,
          healthScore: Number(avgHealth.toFixed(1))
        });
      } else {
        monthlyData.push({
          month: months[month],
          monthNumber: month + 1,
          averageWeight: 0,
          weightGain: 0,
          feedConversionRatio: 0,
          mortalityCount: 0,
          totalPigs: 0,
          healthScore: 0
        });
      }
    }

    return monthlyData;
  }

  private static async getTotalPigsTracked(year: number): Promise<number> {
    const collection = await getCollection('pig_performance');
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const uniquePigs = await collection.distinct('pigId', {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    return uniquePigs.length;
  }

  private static calculateAverageWeightGain(records: any[]): number {
    const gains = records.filter((r: any) => r.weightGain).map((r: any) => r.weightGain);
    return gains.length > 0 ? Number((gains.reduce((a: number, b: number) => a + b, 0) / gains.length).toFixed(3)) : 0;
  }

  private static async calculateMortalityRate(year: number): Promise<number> {
    // This would need actual mortality data from your database
    return 0;
  }

  private static calculateAverageFeedConversion(records: any[]): number {
    const fcrs = records.filter((r: any) => r.feedConversionRatio).map((r: any) => r.feedConversionRatio);
    return fcrs.length > 0 ? Number((fcrs.reduce((a: number, b: number) => a + b, 0) / fcrs.length).toFixed(2)) : 0;
  }

  private static calculateAverageHealthScore(records: any[]): number {
    return records.length > 0 ? Number((records.reduce((sum: number, record: any) => sum + record.healthScore, 0) / records.length).toFixed(1)) : 0;
  }
}