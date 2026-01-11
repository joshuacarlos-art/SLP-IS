// Unified Performance Types - Updated to match existing types

export interface Caretaker {
  _id?: string;
  id?: string;
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  extension?: string;
  participantType: string;
  sex: string;
  isLGBTQMember: boolean;
  contactNumber?: string;
  slpAssociation: string;
  
  // Address Information
  houseLotNo?: string;
  street?: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  region: string;
  
  // SLP Association Details
  slpaName?: string;
  slpaDesignation?: string;
  
  // Modality Information
  modality: string;
  dateProvided: string;
  
  // Additional fields
  status?: 'active' | 'inactive' | 'on_leave' | 'on-leave';
  profilePhoto?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // For display purposes (computed fields)
  fullName?: string;
  email?: string;
  dateStarted?: string;
  
  // Performance fields (added for performance monitoring)
  performanceScore?: number;
  totalAssessments?: number;
  lastAssessment?: Date;
  rank?: number;
}

export interface PerformanceAssessment {
  _id?: string;
  id?: string;
  caretakerId: string;
  assessmentDate: Date;
  date?: Date;
  rating: number;
  comments?: string;
  areasOfImprovement?: string[];
  strengths?: string[];
  assessedBy: string;
  reviewer?: string;
  categories?: {
    punctuality: number;
    communication: number;
    patientCare: number;
    professionalism: number;
    technicalSkills: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssessmentSummary {
  averageRating: number;
  totalAssessments: number;
  categoryAverages: {
    punctuality: number;
    communication: number;
    patientCare: number;
    professionalism: number;
    technicalSkills: number;
  };
  performanceLevel: string;
}

// Performance Monitoring Types
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number; // Percentage (0-100)
  target: number; // Percentage (0-100)
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  description: string;
  category: 'attendance' | 'quality' | 'efficiency' | 'skills' | 'satisfaction';
  icon?: React.ReactNode;
  originalValue?: number;
  originalUnit?: string;
}

export interface PerformanceAlert {
  id: string;
  caretakerId?: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  title: string;
  description: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  resolved: boolean;
  actionRequired: boolean;
}

export interface PerformanceTrendData {
  period: string;
  date: string;
  overallScore: number;
  attendance: number;
  patientCare: number;
  professionalism: number;
  skills: number;
  communication: number;
  shiftsCompleted: number;
}

export interface PerformanceComparison {
  metric: string;
  caretakerValue: number;
  averageValue: number;
  top25Percentile: number;
  rank: number;
  percentile: number;
}

export interface CaretakerPerformanceSummary {
  caretakerId: string;
  caretakerName: string;
  performanceScore: number;
  rank: number;
  percentile: number;
  totalAssessments: number;
  lastAssessment: Date;
  averageRating: number;
  trend: 'improving' | 'stable' | 'declining';
  association?: string;
  status?: string;
}

export interface ShiftPerformance {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  patientName: string;
  patientCondition: string;
  tasksCompleted: number;
  totalTasks: number;
  rating: number;
  notes: string;
  issues?: string[];
  originalRating?: number;
  ratingScale?: number;
}

export interface SkillAssessment {
  id: string;
  skillName: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  lastAssessed: string;
  nextAssessment: string;
  improvement: number;
  certified: boolean;
  certificationExpiry?: string;
  originalLevel?: number;
  levelScale?: number;
}

// Helper functions
export const getFullName = (caretaker: Caretaker): string => {
  const { firstName, lastName, middleName, extension } = caretaker;
  let fullName = `${firstName} ${lastName}`;
  if (middleName) fullName = `${firstName} ${middleName} ${lastName}`;
  if (extension) fullName += ` ${extension}`;
  return fullName;
};

export const getEmail = (caretaker: Caretaker): string => {
  if (caretaker.email) return caretaker.email;
  return `${caretaker.firstName.toLowerCase()}.${caretaker.lastName.toLowerCase()}@care.com`;
};

export const convertToPercentage = (value: number, scale: number = 5): number => {
  return (value / scale) * 100;
};

export const convertFromPercentage = (percentage: number, scale: number = 5): number => {
  return (percentage / 100) * scale;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getPerformanceLevel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Satisfactory';
  return 'Needs Improvement';
};

export const getPerformanceColor = (score: number): string => {
  if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

export const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'on-leave':
    case 'on_leave':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'inactive':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};