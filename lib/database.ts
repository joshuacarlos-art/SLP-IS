export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'farmer' | 'viewer';
  associationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// For creating new users (without _id)
export interface CreateUserInput {
  name: string;
  email: string;
  role: 'admin' | 'farmer' | 'viewer';
  associationId?: string;
}

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
  location: string;
  contact_person: string;
  contact_number: string;
  email: string;
  archived: boolean;
  created_at: Date;
  updated_at: Date;
}

// For creating new associations (without _id)
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
  location: string;
  contact_person: string;
  contact_number: string;
  email: string;
  archived: boolean;
}

export interface Pig {
  _id: string;
  earTag: string;
  associationId: string;
  breed: string;
  dateOfBirth: Date;
  weight: number;
  status: 'active' | 'sold' | 'deceased' | 'transferred';
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  _id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  timestamp: Date;
}

// For creating new activity logs (without _id)
export interface CreateActivityLogInput {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
}