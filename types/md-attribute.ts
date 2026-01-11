export interface MDAttribute {
  _id?: string;
  id: string;
  project_id: string;
  assessment_date: string;
  market_demand_score: number;
  market_demand_remarks: string;
  market_supply_score: number;
  market_supply_remarks: string;
  enterprise_plan_score: number;
  enterprise_plan_remarks: string;
  financial_stability_score: number;
  financial_stability_remarks: string;
  total_score: number;
  livelihood_status: 'improved' | 'stable' | 'declined';
  assessed_by: string;
  created_at: string;
  updatedAt?: string;
  is_archived: boolean;
}

export interface MDAttributeFormData {
  project_id: string;
  assessment_date: string;
  market_demand_score: number;
  market_demand_remarks: string;
  market_supply_score: number;
  market_supply_remarks: string;
  enterprise_plan_score: number;
  enterprise_plan_remarks: string;
  financial_stability_score: number;
  financial_stability_remarks: string;
  livelihood_status: 'improved' | 'stable' | 'declined';
  assessed_by: string;
  is_archived: boolean;
}