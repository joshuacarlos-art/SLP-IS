export interface GeneralProject {
  _id?: string;
  project_id: string;
  project_name: string;
  participant_name: string;
  barangay: string;
  city_municipality: string;
  province: string;
  enterprise_type: string;
  association_name: string;
  monitoring_date: string;
  project_status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  budget_allocation?: number;
  actual_expenditure?: number;
  start_date?: string;
  estimated_completion?: string;
  project_description?: string;
  objectives?: string[];
  challenges?: string[];
  achievements?: string[];
  contact_person?: string;
  contact_number?: string;
  email?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  photos?: string[];
  documents?: string[];
  archived?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectFormData {
  project_name: string;
  participant_name: string;
  barangay: string;
  city_municipality: string;
  province: string;
  enterprise_type: string;
  association_name: string;
  monitoring_date: string;
  project_status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  budget_allocation?: number;
  start_date?: string;
  estimated_completion?: string;
  project_description?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
}

export interface GeneralInfoStats {
  totalProjects: number;
  totalAssociations: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  projectsThisMonth: number;
  projectsByStatus: {
    planning: number;
    ongoing: number;
    completed: number;
    cancelled: number;
  };
  projectsByBarangay: { barangay: string; count: number }[];
}