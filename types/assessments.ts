export interface FinalAssessment {
  id: string;
  project_id: string;
  project_name: string;
  assessment_type: string;
  total_rating: number;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  accomplished_by: string;
  reviewed_by?: string;
  approved_by?: string;
  assessment_date: string;
  created_at: string;
  overall_score: number;
  max_score: number;
  sections: AssessmentSection[];
}

export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  weight: number;
  score: number;
  max_score: number;
  criteria: AssessmentCriteria[];
}

export interface AssessmentCriteria {
  id: string;
  description: string;
  score: number;
  max_score: number;
  comments: string;
}

export interface Project {
  id: string;
  enterpriseSetup: {
    projectName: string;
    enterpriseType: string;
  };
}