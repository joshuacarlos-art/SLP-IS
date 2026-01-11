export interface InstitutionalBuyer {
  _id?: string; // MongoDB ObjectId as string
  buyer_id: string; // Generated unique ID: BUY-{timestamp}-{random}
  buyer_name: string; // Company/Organization name
  contact_person: string; // Primary contact name
  contact_number: string; // Phone number
  email: string; // Email address
  type: BuyerType; // Type of institution
  address?: string; // Physical address (optional)
  status: BuyerStatus; // Active/Inactive status
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}

export type BuyerType = 
  | 'corporate'
  | 'government' 
  | 'educational'
  | 'healthcare'
  | 'retail'
  | 'other';

// Update BuyerStatus to include 'draft'
export type BuyerStatus = 'active' | 'draft'; // Removed 'inactive', added 'draft'

export interface InstitutionalBuyerInput {
  buyer_name: string;
  contact_person: string;
  contact_number: string;
  email: string;
  type: BuyerType;
  address?: string;
  status?: BuyerStatus; // Optional, defaults to 'draft'
}

export interface InstitutionalBuyerUpdate {
  buyer_name?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  type?: BuyerType;
  address?: string;
  status?: BuyerStatus;
  updatedAt: Date;
}

export interface BuyerStats {
  totalBuyers: number;
  activeBuyers: number;
  draftBuyers: number; // Changed from inactiveBuyers to draftBuyers
  buyersByType: {
    type: string;
    count: number;
  }[];
}

export interface BuyersResponse {
  data: InstitutionalBuyer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Add the missing types that are causing errors:
export interface ProjectBuyer {
  _id?: string;
  project_id: string;
  buyer_id: string;
  buyer_name: string;
  contact_person: string;
  contact_number: string;
  email: string;
  type: BuyerType;
  address?: string;
  status: BuyerStatus;
  requirements?: string;
  is_archived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BuyerFormData = {
  buyer_name: string;
  contact_person: string;
  contact_number: string;
  email: string;
  type: BuyerType;
  address?: string;
  status?: BuyerStatus; // Now includes 'draft'
};