export interface MonitoringRecord {
  id: string;
  _id?: string; // Add this line
  project_id: string;
  monitoring_date: string;
  monitoring_year: number;
  monitoring_frequency: string;
  field_officer_id: string;
  provincial_coordinator?: string;
  monitoring_type: string;
  monthly_gross_sales: number;
  monthly_cost_of_sales: number;
  monthly_gross_profit: number;
  monthly_operating_expenses: number;
  monthly_net_income: number;
  verification_methods?: string;
  status: string;
  notes_remarks?: string;
  created_at?: string;
  updated_at?: string;
  is_archived?: boolean;
  
  association_ids?: string[];
  financial_status?: string;
  physical_progress?: number;
  challenges?: string;
  recommendations?: string;
  next_review_date?: string;
  budget_utilization?: number;
}

export interface Project {
  id: string;
  enterpriseSetup: {
    projectName: string;
    enterpriseType: string;
    status: string;
    startDate: string;
    cityMunicipality: string;
    province: string;
    region?: string;
  };
  financialInformation?: {
    totalSales: number;
    netIncomeLoss: number;
    totalSavingsGenerated?: number;
    cashOnHand?: number;
    cashOnBank?: number;
  };
  operationalInformation?: {
    multipleAssociations: any[];
    microfinancingInstitutions: boolean;
    microfinancingServices: boolean;
    enterprisePlanExists: boolean;
    beingDelivered: boolean;
    availedServices: string[];
    assets: any[];
    institutionalBuyers: any[];
  };
  progress?: number;
  associationNames?: string[];
  associationIds?: string[];
  associationName?: string;
  associationLocation?: string;
  associationRegion?: string;
  associationProvince?: string;
  monitoringRecords?: MonitoringRecord[];
  latestMonitoring?: MonitoringRecord;
  participant?: {
    firstName: string;
    lastName: string;
  };
}

export interface MonitoringFormValues {
  project_id: string;
  monitoring_date: string;
  monitoring_year: number;
  monitoring_frequency: string;
  field_officer_id: string;
  provincial_coordinator?: string;
  monitoring_type: string;
  monthly_gross_sales: number;
  monthly_cost_of_sales: number;
  monthly_operating_expenses: number;
  verification_methods?: string;
  status: string;
  notes_remarks?: string;
  association_ids?: string[];
  financial_status?: string;
  physical_progress?: number;
  challenges?: string;
  recommendations?: string;
  next_review_date?: string;
  budget_utilization?: number;
}