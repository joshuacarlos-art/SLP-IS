import { ObjectId } from 'mongodb';
import { getCollection, toObjectId } from '@/lib/mongodb';
import { 
  PigPerformanceMetrics, 
  PigPerformanceInput,
  PigPerformanceSummary, 
  PerformanceAlert,
  AdminComment,
  PerformanceSummary
} from '@/types/pigPerformance';

export class PigPerformanceService {
  private static readonly COLLECTION = 'pig_performance';
  private static readonly ALERTS_COLLECTION = 'performance_alerts';
  private static readonly SUMMARIES_COLLECTION = 'performance_summaries';

  // Add new performance metrics
  static async addPerformanceMetrics(input: PigPerformanceInput): Promise<void> {
    const collection = await getCollection(this.COLLECTION);
    
    const now = new Date();
    
    // Calculate feed conversion ratio if weight gain is provided
    const feedConversionRatio = input.weightGain && input.weightGain > 0 
      ? input.feedIntake / input.weightGain 
      : undefined;

    // Create document for MongoDB
    const performanceDoc = {
      pigId: input.pigId,
      date: input.date,
      weight: input.weight,
      weightGain: input.weightGain,
      feedIntake: input.feedIntake,
      feedConversionRatio,
      waterConsumption: input.waterConsumption,
      activityLevel: input.activityLevel,
      healthScore: input.healthScore,
      temperature: input.temperature,
      notes: input.notes,
      adminComments: [],
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(performanceDoc);
    
    // Check for alerts after adding metrics
    await this.checkForAlerts(input.pigId, {
      ...performanceDoc,
      _id: result.insertedId
    });
  }

  // Get performance history for a pig
  static async getPerformanceHistory(pigId: string, days?: number): Promise<PigPerformanceMetrics[]> {
    const collection = await getCollection(this.COLLECTION);
    
    const query: any = { pigId };
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query.date = { $gte: startDate };
    }

    const metrics = await collection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return metrics.map(metric => ({
      _id: metric._id.toString(),
      pigId: metric.pigId.toString(),
      date: metric.date,
      weight: metric.weight,
      weightGain: metric.weightGain,
      feedIntake: metric.feedIntake,
      feedConversionRatio: metric.feedConversionRatio,
      waterConsumption: metric.waterConsumption,
      activityLevel: metric.activityLevel,
      healthScore: metric.healthScore,
      temperature: metric.temperature,
      notes: metric.notes,
      adminComments: metric.adminComments || [],
      createdAt: metric.createdAt,
      updatedAt: metric.updatedAt
    })) as PigPerformanceMetrics[];
  }

  // Calculate performance summary
  static async getPerformanceSummary(pigId: string, days?: number): Promise<PigPerformanceSummary> {
    const metrics = await this.getPerformanceHistory(pigId, days || 30);
    
    if (metrics.length === 0) {
      throw new Error('No performance data found for this pig');
    }

    const weightGains = metrics
      .filter(m => m.weightGain !== undefined)
      .map(m => m.weightGain as number);
    
    const feedRatios = metrics
      .filter(m => m.feedConversionRatio !== undefined)
      .map(m => m.feedConversionRatio as number);

    const healthScores = metrics.map(m => m.healthScore);
    
    const averageDailyGain = weightGains.length > 0 
      ? weightGains.reduce((sum, gain) => sum + gain, 0) / weightGains.length 
      : 0;

    const averageFCR = feedRatios.length > 0
      ? feedRatios.reduce((sum, fcr) => sum + fcr, 0) / feedRatios.length
      : 0;

    const totalWeightGain = metrics.length > 1 
      ? metrics[0].weight - metrics[metrics.length - 1].weight 
      : 0;
    
    // Calculate health trend
    const recentHealth = healthScores.slice(0, Math.min(7, healthScores.length));
    const previousHealth = healthScores.slice(7, 14);
    const recentAvg = recentHealth.reduce((a, b) => a + b, 0) / recentHealth.length;
    const previousAvg = previousHealth.length > 0 
      ? previousHealth.reduce((a, b) => a + b, 0) / previousHealth.length 
      : recentAvg;
    
    const healthTrend = recentAvg > previousAvg + 0.5 ? 'improving' 
      : recentAvg < previousAvg - 0.5 ? 'declining' 
      : 'stable';

    // Calculate performance score (0-100)
    const performanceScore = this.calculatePerformanceScore(
      averageDailyGain,
      averageFCR,
      recentAvg
    );

    return {
      pigId,
      averageDailyGain,
      averageFeedConversionRatio: averageFCR,
      totalWeightGain,
      healthTrend,
      performanceScore,
      lastUpdated: new Date()
    };
  }

  // Check for performance alerts
  private static async checkForAlerts(pigId: string, metrics: PigPerformanceMetrics): Promise<void> {
    const alerts: Omit<PerformanceAlert, '_id'>[] = [];
    const alertsCollection = await getCollection(this.ALERTS_COLLECTION);

    // Check for weight loss
    if (metrics.weightGain && metrics.weightGain < 0) {
      alerts.push({
        pigId,
        type: 'weight_loss',
        severity: 'high',
        message: `Pig ${pigId} experienced weight loss of ${Math.abs(metrics.weightGain).toFixed(2)}kg`,
        metric: 'weightGain',
        value: metrics.weightGain,
        threshold: 0,
        resolved: false,
        createdAt: new Date()
      });
    }

    // Check for poor feed conversion
    if (metrics.feedConversionRatio && metrics.feedConversionRatio > 3.5) {
      alerts.push({
        pigId,
        type: 'poor_fcr',
        severity: 'medium',
        message: `Poor feed conversion ratio: ${metrics.feedConversionRatio.toFixed(2)}`,
        metric: 'feedConversionRatio',
        value: metrics.feedConversionRatio,
        threshold: 3.5,
        resolved: false,
        createdAt: new Date()
      });
    }

    // Check for low health score
    if (metrics.healthScore < 5) {
      alerts.push({
        pigId,
        type: 'low_health',
        severity: 'high',
        message: `Low health score: ${metrics.healthScore}/10`,
        metric: 'healthScore',
        value: metrics.healthScore,
        threshold: 5,
        resolved: false,
        createdAt: new Date()
      });
    }

    // Check for high temperature
    if (metrics.temperature && metrics.temperature > 39.5) {
      alerts.push({
        pigId,
        type: 'high_temperature',
        severity: 'medium',
        message: `Elevated body temperature: ${metrics.temperature}°C`,
        metric: 'temperature',
        value: metrics.temperature,
        threshold: 39.5,
        resolved: false,
        createdAt: new Date()
      });
    }

    // Check for low activity
    if (metrics.activityLevel === 'low') {
      alerts.push({
        pigId,
        type: 'low_activity',
        severity: 'low',
        message: 'Low activity level detected',
        metric: 'activityLevel',
        value: 0,
        threshold: 0,
        resolved: false,
        createdAt: new Date()
      });
    }

    // Insert alerts if any
    if (alerts.length > 0) {
      await alertsCollection.insertMany(alerts);
    }
  }

  // Get active alerts for a pig
  static async getActiveAlerts(pigId: string): Promise<PerformanceAlert[]> {
    const collection = await getCollection(this.ALERTS_COLLECTION);
    
    const alerts = await collection
      .find({ pigId, resolved: false })
      .sort({ createdAt: -1 })
      .toArray();

    return alerts.map(alert => ({
      _id: alert._id.toString(),
      pigId: alert.pigId.toString(),
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      resolved: alert.resolved,
      createdAt: alert.createdAt,
      resolvedAt: alert.resolvedAt
    })) as PerformanceAlert[];
  }

  // Resolve an alert
  static async resolveAlert(alertId: string): Promise<void> {
    const collection = await getCollection(this.ALERTS_COLLECTION);
    
    await collection.updateOne(
      { _id: await toObjectId(alertId) },
      { 
        $set: { 
          resolved: true, 
          resolvedAt: new Date() 
        } 
      }
    );
  }

  // Add admin comment to performance metrics
  static async addAdminComment(metricId: string, comment: Omit<AdminComment, '_id' | 'createdAt'>): Promise<void> {
    const collection = await getCollection(this.COLLECTION);
    
    const commentDoc = {
      _id: new ObjectId(),
      createdAt: new Date(),
      ...comment
    };

    await collection.updateOne(
      { _id: await toObjectId(metricId) },
      {
        $push: {
          adminComments: commentDoc
        } as any,
        $set: { updatedAt: new Date() }
      }
    );
  }

  // Create performance summary
  static async createPerformanceSummary(summary: Omit<PerformanceSummary, '_id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const collection = await getCollection(this.SUMMARIES_COLLECTION);
    
    const summaryDoc = {
      ...summary,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await collection.insertOne(summaryDoc);
  }

  // Get performance summaries for a pig
  static async getPerformanceSummaries(pigId: string): Promise<PerformanceSummary[]> {
    const collection = await getCollection(this.SUMMARIES_COLLECTION);
    
    const summaries = await collection
      .find({ pigId })
      .sort({ createdAt: -1 })
      .toArray();

    return summaries.map(summary => ({
      _id: summary._id.toString(),
      pigId: summary.pigId.toString(),
      period: summary.period,
      startDate: summary.startDate,
      endDate: summary.endDate,
      summary: summary.summary,
      recommendations: summary.recommendations,
      createdBy: summary.createdBy,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt
    })) as PerformanceSummary[];
  }

  // Calculate performance score
  private static calculatePerformanceScore(
    avgDailyGain: number,
    feedConversionRatio: number,
    healthScore: number
  ): number {
    const weightGainScore = Math.min(avgDailyGain / 1.0 * 40, 40);
    const feedEfficiencyScore = Math.max(0, 30 - (feedConversionRatio - 2.0) * 10);
    const healthScorePoints = healthScore * 3;

    return Math.round(weightGainScore + feedEfficiencyScore + healthScorePoints);
  }

  // Get performance comparison across multiple pigs
  static async getPerformanceComparison(pigIds: string[]): Promise<PigPerformanceSummary[]> {
    const summaries = await Promise.all(
      pigIds.map(async pigId => {
        try {
          const summary = await this.getPerformanceSummary(pigId);
          return summary;
        } catch {
          return null;
        }
      })
    );

    return summaries.filter((summary): summary is PigPerformanceSummary => summary !== null);
  }

  // Get all pigs with performance data
  static async getPigsWithPerformance(): Promise<string[]> {
    const collection = await getCollection(this.COLLECTION);
    
    const pigs = await collection.distinct('pigId');
    return pigs.map(pig => pig.toString());
  }
}