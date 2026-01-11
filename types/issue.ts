export interface Issue {
  id: string;
  project_id: string;
  project_name: string;
  issue_category: string;
  issue_code: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  date_reported: string;
  date_resolved?: string;
  reported_by: string;
  assigned_to?: string;
  resolution_notes?: string;
  is_archived: boolean;
}

export interface IssueFormData {
  project_id: string;
  project_name: string;
  issue_category: string;
  issue_code: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  date_reported: string;
  date_resolved?: string;
  reported_by: string;
  assigned_to?: string;
  resolution_notes?: string;
  is_archived: boolean;
}

export interface IssueCategory {
  id: string;
  name: string;
  description: string;
}

export interface IssueCode {
  id: string;
  category_id: string;
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}