// pigPerformance.ts - Complete Type Definitions

// ============================================
// PIG TYPES
// ============================================

export interface Pig {
  _id?: string;
  id: string;
  tagNumber: string;
  name: string;
  breed: string;
  birthDate: Date | string;
  gender: 'male' | 'female';
  currentWeight: number;
  status: 'healthy' | 'sick' | 'recovering' | 'deceased' | 'sold';
  penId?: string;
  caretakerId?: string;
  arrivalDate: Date | string;
  source: 'birth' | 'purchase' | 'transfer';
  healthNotes?: string;
  lastVetCheck?: Date | string;
  nextVetCheck?: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// PERFORMANCE METRICS
// ============================================

export interface PigPerformanceMetrics {
  _id?: string;
  pigId: string;
  caretakerId?: string;
  date: Date | string;
  
  // Weight Metrics
  weight: number;
  weightGain?: number; // Calculated
  dailyWeightGain?: number;
  totalWeightGain?: number;
  
  // Feeding Metrics
  feedIntake: number; // kg
  feedConversionRatio?: number; // weight gain / feed intake
  feedingConsistency?: number; // 1-5 scale
  
  // Water & Health
  waterConsumption: number; // liters
  healthScore: number; // 1-10 scale
  activityLevel: 'low' | 'medium' | 'high';
  
  // Vital Signs
  temperature?: number; // °C
  respirationRate?: number; // breaths per minute
  heartRate?: number; // beats per minute
  bodyConditionScore?: number; // 1-5 scale
  
  // Additional Data
  notes?: string;
  medications?: MedicationRecord[];
  vaccinations?: VaccinationRecord[];
  
  // System Fields
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// CARETAKER PIG METRICS (for dashboard)
// ============================================

export interface CaretakerPigMetrics {
  caretakerId: string;
  caretakerName: string;
  
  // Basic Counts
  totalPigsAssigned: number;
  pigsGained: number;
  pigsLost: number;
  pigsSold?: number;
  pigsTransferred?: number;
  
  // Weight Metrics
  averageDailyWeightGain: number; // ADWG in kg/day
  totalWeightGained: number;
  averageWeight: number;
  weightConsistency: number; // 1-100%
  
  // Feeding Metrics
  consistencyScore: number; // 1-100%
  feedConversionEfficiency: number;
  totalFeedConsumed: number;
  averageDailyFeed: number;
  
  // Cleanliness Metrics
  cleanlinessScore: number; // 1-5 scale
  averagePenCleanliness: number;
  cleanlinessConsistency: number; // 1-100%
  
  // Health Metrics
  averageHealthScore: number;
  mortalityRate: number;
  sicknessRate: number;
  
  // Performance Scores
  performanceScore: number; // Overall 1-100
  feedingScore: number;
  healthScore: number;
  cleanlinessScoreTotal: number;
  
  // Timestamps
  periodStart: Date | string;
  periodEnd: Date | string;
  updatedAt: Date;
}

// ============================================
// PEN & CLEANLINESS
// ============================================

export interface Pen {
  _id?: string;
  id: string;
  penNumber: string;
  name?: string;
  capacity: number;
  currentOccupancy: number;
  assignedCaretakerId?: string;
  assignedCaretakerIds?: string[];
  
  // Cleanliness
  cleanlinessScore: number; // 1-5 scale
  lastCleaned: Date | string;
  cleaningFrequency: 'daily' | 'every_other_day' | 'weekly';
  status: 'clean' | 'needs_cleaning' | 'under_cleaning';
  
  // Pen Details
  size: {
    length: number;
    width: number;
    area: number;
  };
  type: 'nursery' | 'grower' | 'finisher' | 'farrowing' | 'breeding';
  equipment?: string[];
  
  // System
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CleanlinessLog {
  _id?: string;
  penId: string;
  caretakerId: string;
  date: Date | string;
  cleanlinessScore: number; // 1-5 scale
  beforePhoto?: string;
  afterPhoto?: string;
  notes?: string;
  completed: boolean;
  verifiedBy?: string;
  verifiedAt?: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// FEEDING SCHEDULE
// ============================================

export interface FeedingSchedule {
  _id?: string;
  caretakerId: string;
  pigId: string;
  penId: string;
  scheduledTime: string; // "08:00", "14:00", "18:00"
  actualTime?: string;
  status: 'scheduled' | 'completed' | 'missed' | 'delayed';
  feedAmount: number; // kg
  feedType: string;
  notes?: string;
  date: Date | string;
  completedBy?: string;
  completedAt?: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// MEDICAL RECORDS
// ============================================

export interface MedicationRecord {
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date | string;
  endDate: Date | string;
  administeredBy: string;
  notes?: string;
}

export interface VaccinationRecord {
  name: string;
  date: Date | string;
  nextDue: Date | string;
  administeredBy: string;
  lotNumber?: string;
  notes?: string;
}

// ============================================
// PERFORMANCE SUMMARIES
// ============================================

export interface PerformanceSummary {
  _id?: string;
  pigId: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate: Date | string;
  endDate: Date | string;
  
  // Summary Metrics
  summary: string;
  averageDailyGain: number;
  totalWeightGain: number;
  averageFeedConversionRatio: number;
  averageHealthScore: number;
  
  // Recommendations
  recommendations: string[];
  strengths: string[];
  areasForImprovement: string[];
  
  // System
  createdBy: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// ============================================
// PERFORMANCE ALERTS
// ============================================

export interface PerformanceAlert {
  _id?: string;
  pigId: string;
  caretakerId?: string;
  type: 'weight_loss' | 'low_activity' | 'high_temperature' | 'poor_fcr' | 'low_health' | 'missed_feeding' | 'pen_dirty';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date | string;
  notes?: string;
  createdAt: Date | string;
}

// ============================================
// ADMIN COMMENTS
// ============================================

export interface AdminComment {
  _id?: string;
  adminId: string;
  adminName: string;
  comment: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

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

export interface HealthStatusDistribution {
  excellent: number; // 9-10
  good: number;      // 7-8
  fair: number;      // 5-6
  poor: number;      // 3-4
  critical: number;  // 0-2
}

export interface PerformanceInsight {
  type: 'positive' | 'warning' | 'negative';
  title: string;
  description: string;
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  recommendation?: string;
}

// ============================================
// PERFORMANCE COMPARISON
// ============================================

export interface PerformanceComparison {
  pigId: string;
  pigName: string;
  breed: string;
  ageDays: number;
  currentWeight: number;
  averageDailyGain: number;
  feedConversionRatio: number;
  healthScore: number;
  performanceScore: number;
  rank: number;
  trend: 'improving' | 'stable' | 'declining';
}

// ============================================
// INPUT TYPES (Forms)
// ============================================

export interface PigPerformanceInput {
  pigId: string;
  date: Date | string;
  weight: number;
  feedIntake: number;
  waterConsumption: number;
  activityLevel: 'low' | 'medium' | 'high';
  healthScore: number;
  temperature?: number;
  notes?: string;
  caretakerId?: string;
}

export interface CleanlinessInput {
  penId: string;
  caretakerId: string;
  cleanlinessScore: number;
  notes?: string;
  beforePhoto?: string;
  afterPhoto?: string;
}

export interface FeedingInput {
  pigId: string;
  caretakerId: string;
  feedAmount: number;
  feedType: string;
  notes?: string;
  scheduledTime?: string;
}

// ============================================
// REPORT TYPES
// ============================================

export interface PerformanceReport {
  period: string;
  startDate: Date | string;
  endDate: Date | string;
  totalPigs: number;
  averageDailyGain: number;
  totalWeightGain: number;
  averageFeedConversionRatio: number;
  mortalityRate: number;
  averageHealthScore: number;
  topPerformers: PerformanceComparison[];
  areasNeedingAttention: PerformanceAlert[];
  recommendations: string[];
}

// ============================================
// ENUM TYPES
// ============================================

export type TimeRange = 'week' | 'month' | 'quarter' | 'year';
export type PerformanceLevel = 'excellent' | 'very-good' | 'good' | 'satisfactory' | 'needs-improvement';
export type AssessmentStatus = 'completed' | 'pending' | 'in-progress';
export type PigStatus = 'healthy' | 'sick' | 'recovering' | 'deceased' | 'sold';
export type PenStatus = 'clean' | 'needs_cleaning' | 'under_cleaning' | 'quarantine';
export type ActivityLevel = 'low' | 'medium' | 'high';

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate Feed Conversion Ratio
export const calculateFCR = (weightGain: number, feedIntake: number): number => {
  if (feedIntake === 0) return 0;
  return feedIntake / weightGain;
};

// Calculate Average Daily Gain
export const calculateADG = (startWeight: number, endWeight: number, days: number): number => {
  if (days === 0) return 0;
  return (endWeight - startWeight) / days;
};

// Get Performance Level
export const getPerformanceLevel = (score: number): PerformanceLevel => {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'very-good';
  if (score >= 70) return 'good';
  if (score >= 60) return 'satisfactory';
  return 'needs-improvement';
};

// Get Health Status
export const getHealthStatus = (score: number): string => {
  if (score >= 9) return 'Excellent';
  if (score >= 7) return 'Good';
  if (score >= 5) return 'Fair';
  if (score >= 3) return 'Poor';
  return 'Critical';
};

// Calculate Mortality Rate
export const calculateMortalityRate = (deceased: number, total: number): number => {
  if (total === 0) return 0;
  return (deceased / total) * 100;
};