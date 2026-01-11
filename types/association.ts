export interface Association {
  _id?: string;
  id?: string;
  name: string;
  date_formulated: string | Date;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
  operational_reason: string;
  covid_affected: boolean;
  profit_sharing: boolean;
  profit_sharing_amount: number;
  loan_scheme: boolean;
  loan_scheme_amount: number;
  no_active_members: number;
  no_inactive_members: number;
  registrations_certifications: string[];
  final_org_adjectival_rating: string;
  final_org_rating_assessment: string;
  location: string;
  contact_person: string;
  contact_number: string;
  email: string;
  archived: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface CreateAssociationInput {
  name: string;
  date_formulated: string | Date;
  location: string;
  contact_person: string;
  contact_number: string;
  email: string;
  operational_reason?: string;
  no_active_members?: number;
  no_inactive_members?: number;
  status?: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
  covid_affected?: boolean;
  profit_sharing?: boolean;
  profit_sharing_amount?: number;
  loan_scheme?: boolean;
  loan_scheme_amount?: number;
  registrations_certifications?: string[];
  final_org_adjectival_rating?: string;
  final_org_rating_assessment?: string;
  archived?: boolean;
}

export interface UpdateAssociationInput {
  name?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
  date_formulated?: string | Date;
  operational_reason?: string;
  no_active_members?: number;
  no_inactive_members?: number;
  covid_affected?: boolean;
  profit_sharing?: boolean;
  profit_sharing_amount?: number;
  loan_scheme?: boolean;
  loan_scheme_amount?: number;
  registrations_certifications?: string[];
  final_org_adjectival_rating?: string;
  final_org_rating_assessment?: string;
  location?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  archived?: boolean;
}