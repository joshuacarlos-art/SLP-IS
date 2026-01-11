// types/database.ts - Update your Association interface
export interface Association {
  _id: string;
  name: string;
  date_formulated: Date;
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
  location: string; // Add this
  contact_person: string; // Add this
  contact_number: string; // Add this
  email: string; // Add this
  archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAssociationInput {
  name: string;
  date_formulated: Date;
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
  location: string; // Add this
  contact_person: string; // Add this
  contact_number: string; // Add this
  email: string; // Add this
  archived: boolean;
}