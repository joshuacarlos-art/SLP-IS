export interface MonthlyPerformance {
  month: string;
  monthNumber: number;
  averageWeight: number;
  weightGain: number;
  feedConversionRatio: number;
  mortalityCount: number;
  totalPigs: number;
  healthScore: number;
}

export interface PerformanceMetrics {
  year: number;
  totalPigs: number;
  averageWeightGain: number;
  mortalityRate: number;
  feedConversionRatio: number;
  averageHealthScore: number;
  monthlyData: MonthlyPerformance[];
}

export interface HealthStatusDistribution {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
  critical: number;
}

export interface PerformanceInsight {
  type: 'positive' | 'warning' | 'negative';
  title: string;
  description: string;
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}