export interface Association {
  _id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
  dateFormulated: Date;
  operationalReason: string;
  activeMembers: number;
  inactiveMembers: number;
  covidAffected: boolean;
  hasProfitSharing: boolean;
  hasLoanScheme: boolean;
  registrationsCertifications: string[];
  finalOrgAdjectivalRating: string;
  finalOrgRatingAssessment: string;
  location: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialReport {
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

export interface RatingAssessment {
  category: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface AssociationRating {
  _id: string;
  associationId: string;
  associationName: string;
  ratingPeriod: string;
  overallRating: number;
  adjectivalRating: string;
  assessments: RatingAssessment[];
  financialPerformance: number;
  operationalEfficiency: number;
  memberSatisfaction: number;
  complianceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialSummary {
  totalSales: number;
  totalProfit: number;
  totalBalance: number;
  totalAssociations: number;
  totalReports: number;
  averageProfitMargin: number;
  topPerformingAssociations: {
    name: string;
    profit: number;
    balance: number;
  }[];
  recentReports: FinancialReport[];
}

export interface DashboardStats {
  financialSummary: FinancialSummary;
  recentRatings: AssociationRating[];
  performanceTrends: {
    period: string;
    sales: number;
    profit: number;
    balance: number;
  }[];
}

export interface Caretaker {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  extension?: string;
  contactNumber?: string;
  email?: string;
  slpAssociation: string;
  modality?: string;
  status: string;
  cityMunicipality?: string;
  province?: string;
  region?: string;
  participantType: string;
  sex: string;
  createdAt?: Date;
  updatedAt?: Date;
  dateStarted?: string;
}

export interface Project {
  _id: string;
  enterpriseSetup: {
    projectName: string;
    enterpriseType: string;
    status: string;
    startDate: string;
    region: string;
    province: string;
    cityMunicipality: string;
    barangay: string;
  };
  financialInformation: {
    totalSales: number;
    netIncomeLoss: number;
    totalSavingsGenerated: number;
    cashOnHand: number;
    cashOnBank: number;
  };
  associationId?: string;
  associationName?: string;
}