// lib/utils/type-adapters.ts

// Use Record<string, unknown> type for flexibility with imported types
type PerformanceCaretaker = Record<string, unknown> & {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: unknown;
};

type PerformanceAssessmentType = Record<string, unknown> & {
  _id?: string;
  id?: string;
  caretakerId: string;
  rating: number;
  assessmentDate?: Date | string;
  assessedBy?: string;
  date?: Date | string;
  [key: string]: unknown;
};

// Define the component type interfaces
interface ComponentCaretaker {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  extension?: string;
  email?: string;
  phone?: string;
  contactNumber?: string;
  status?: 'active' | 'inactive' | 'on-leave' | 'on_leave';
  slpAssociation?: string;
  participantType?: string;
  sex?: string;
  dateStarted?: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
  region?: string;
  address?: string;
  qualifications?: string[];
  specialization?: string[];
  profileImage?: string | null;
  modality?: string;
  dateProvided?: string;
}

interface ComponentPerformanceAssessment {
  _id?: string;
  id?: string;
  caretakerId: string;
  rating: number;
  categories?: {
    punctuality: number;
    communication: number;
    patientCare: number;
    professionalism: number;
    technicalSkills: number;
  };
  assessmentDate: Date;
  assessedBy: string;
  notes?: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
  assessorRole?: string;
  overallScore?: number;
  comments?: string;
  recommendations?: string[];
  status?: 'completed' | 'pending' | 'in-progress';
}

// Helper function to safely get property with fallback
function getProperty<T>(obj: Record<string, unknown>, key: string, defaultValue: T): T {
  return (obj[key] as T) ?? defaultValue;
}

// Convert performance types to component types
export const adaptCaretakerToComponent = (caretaker: PerformanceCaretaker): ComponentCaretaker => {
  const dateProvided = getProperty(caretaker, 'dateProvided', null);
  
  return {
    _id: caretaker._id,
    id: caretaker.id || caretaker._id,
    firstName: getProperty(caretaker, 'firstName', 'Unknown'),
    lastName: getProperty(caretaker, 'lastName', 'Caretaker'),
    middleName: getProperty(caretaker, 'middleName', undefined),
    extension: getProperty(caretaker, 'extension', undefined),
    email: getProperty(caretaker, 'email', undefined),
    phone: getProperty(caretaker, 'phone', undefined),
    contactNumber: getProperty(caretaker, 'contactNumber', undefined),
    status: getProperty(caretaker, 'status', undefined),
    slpAssociation: getProperty(caretaker, 'slpAssociation', undefined),
    participantType: getProperty(caretaker, 'participantType', undefined),
    sex: getProperty(caretaker, 'sex', undefined),
    dateStarted: getProperty(caretaker, 'dateStarted', undefined),
    createdAt: caretaker.createdAt instanceof Date ? caretaker.createdAt : undefined,
    updatedAt: caretaker.updatedAt instanceof Date ? caretaker.updatedAt : undefined,
    barangay: getProperty(caretaker, 'barangay', undefined),
    cityMunicipality: getProperty(caretaker, 'cityMunicipality', undefined),
    province: getProperty(caretaker, 'province', undefined),
    region: getProperty(caretaker, 'region', undefined),
    address: getProperty(caretaker, 'address', undefined),
    qualifications: getProperty(caretaker, 'qualifications', undefined),
    specialization: getProperty(caretaker, 'specialization', undefined),
    profileImage: getProperty(caretaker, 'profileImage', undefined),
    modality: getProperty(caretaker, 'modality', ''),
    dateProvided: dateProvided ? 
      (typeof dateProvided === 'string' ? dateProvided : 
        (dateProvided as Date).toISOString?.() || new Date().toISOString()) : 
      new Date().toISOString()
  };
};

export const adaptAssessmentToComponent = (assessment: PerformanceAssessmentType): ComponentPerformanceAssessment => {
  const assessmentDateValue = getProperty(assessment, 'assessmentDate', new Date());
  const dateValue = getProperty(assessment, 'date', new Date());
  
  const assessmentDate = assessmentDateValue instanceof Date ? 
    assessmentDateValue : 
    new Date(assessmentDateValue as string);
  
  const date = dateValue instanceof Date ? 
    dateValue : 
    new Date(dateValue as string);
  
  // Ensure valid dates
  const safeAssessmentDate = isNaN(assessmentDate.getTime()) ? new Date() : assessmentDate;
  const safeDate = isNaN(date.getTime()) ? new Date() : date;
  
  return {
    _id: assessment._id,
    id: assessment.id || assessment._id,
    caretakerId: assessment.caretakerId,
    rating: assessment.rating,
    categories: getProperty(assessment, 'categories', undefined),
    assessmentDate: safeAssessmentDate,
    assessedBy: getProperty(assessment, 'assessedBy', 'Unknown'),
    notes: getProperty(assessment, 'notes', undefined),
    date: safeDate,
    createdAt: assessment.createdAt instanceof Date ? assessment.createdAt : undefined,
    updatedAt: assessment.updatedAt instanceof Date ? assessment.updatedAt : undefined,
    assessorRole: getProperty(assessment, 'assessorRole', undefined),
    overallScore: getProperty(assessment, 'overallScore', undefined),
    comments: getProperty(assessment, 'comments', undefined),
    recommendations: getProperty(assessment, 'recommendations', undefined),
    status: getProperty(assessment, 'status', undefined)
  };
};

// Convert arrays
export const adaptCaretakersArray = (caretakers: PerformanceCaretaker[]): ComponentCaretaker[] => {
  return caretakers.map(adaptCaretakerToComponent);
};

export const adaptAssessmentsArray = (assessments: PerformanceAssessmentType[]): ComponentPerformanceAssessment[] => {
  return assessments.map(adaptAssessmentToComponent);
};