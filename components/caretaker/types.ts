export interface Caretaker {
  _id?: string;
  id?: string;
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  extension?: string;
  participantType: string;
  sex: string;
  contactNumber?: string;
  slpAssociation: string;
  
  // Address Information
  houseLotNo?: string;
  street?: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  region: string;
  
  // SLP Association Details
  slpaName?: string;
  slpaDesignation?: string;
  
  // Modality Information
  modality: string;
  dateProvided: string;
  
  // Additional fields
  status?: 'active' | 'inactive' | 'on_leave' | 'on-leave';
  profilePhoto?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // For display purposes (computed fields)
  fullName?: string;
  email?: string;
  dateStarted?: string;
}

export interface PerformanceAssessment {
  _id?: string;
  id?: string;
  caretakerId: string;
  assessmentDate: Date;
  date?: Date;
  rating: number;
  comments?: string;
  areasOfImprovement?: string[];
  strengths?: string[];
  assessedBy: string;
  reviewer?: string;
  categories?: {
    punctuality: number;
    communication: number;
    patientCare: number;
    professionalism: number;
    technicalSkills: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssessmentSummary {
  averageRating: number;
  totalAssessments: number;
  categoryAverages: {
    punctuality: number;
    communication: number;
    patientCare: number;
    professionalism: number;
    technicalSkills: number;
  };
  performanceLevel: string;
}

export interface CaretakerFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  extension?: string;
  participantType: string;
  sex: string;
  contactNumber?: string;
  slpAssociation: string;
  
  // Address Information
  houseLotNo?: string;
  street?: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  region: string;
  
  // SLP Association Details
  slpaName?: string;
  slpaDesignation?: string;
  
  // Modality Information
  modality: string;
  dateProvided: string;
  
  status?: 'active' | 'inactive' | 'on_leave' | 'on-leave';
}

export interface AssessmentFormData {
  caretakerId: string;
  assessmentDate: Date;
  rating: number;
  comments?: string;
  areasOfImprovement?: string[];
  strengths?: string[];
  assessedBy: string;
  categories?: {
    punctuality: number;
    communication: number;
    patientCare: number;
    professionalism: number;
    technicalSkills: number;
  };
}

// Helper function to get full name
export const getFullName = (caretaker: Caretaker): string => {
  const { firstName, lastName, middleName, extension } = caretaker;
  let fullName = `${firstName} ${lastName}`;
  if (middleName) fullName = `${firstName} ${middleName} ${lastName}`;
  if (extension) fullName += ` ${extension}`;
  return fullName;
};