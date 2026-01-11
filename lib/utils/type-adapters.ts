// lib/utils/type-adapters.ts
import { Caretaker as PerformanceCaretaker, PerformanceAssessment as PerformanceAssessmentType } from '@/types/performance';

// Define the component type interfaces locally to avoid circular dependencies
interface ComponentCaretaker {
  _id?: string;
  id?: string;
  firstName: string;  // This is required in component type
  lastName: string;   // This is required in component type
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
  dateProvided?: string;  // This is string in component type
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
  assessmentDate: Date;  // This is Date only in component type
  assessedBy: string;
  notes?: string;
  date: Date;  // This is Date only in component type
  createdAt?: Date;
  updatedAt?: Date;
  assessorRole?: string;
  overallScore?: number;
  comments?: string;
  recommendations?: string[];
  status?: 'completed' | 'pending' | 'in-progress';
}

// Convert performance types to component types
export const adaptCaretakerToComponent = (caretaker: PerformanceCaretaker): ComponentCaretaker => {
  return {
    _id: caretaker._id,
    id: caretaker.id || caretaker._id,
    firstName: caretaker.firstName || 'Unknown',
    lastName: caretaker.lastName || 'Caretaker',
    middleName: caretaker.middleName,
    extension: caretaker.extension,
    email: caretaker.email,
    phone: caretaker.phone,
    contactNumber: caretaker.contactNumber,
    status: caretaker.status,
    slpAssociation: caretaker.slpAssociation,
    participantType: caretaker.participantType,
    sex: caretaker.sex,
    dateStarted: caretaker.dateStarted,
    createdAt: caretaker.createdAt,
    updatedAt: caretaker.updatedAt,
    barangay: caretaker.barangay,
    cityMunicipality: caretaker.cityMunicipality,
    province: caretaker.province,
    region: caretaker.region,
    address: caretaker.address,
    qualifications: caretaker.qualifications,
    specialization: caretaker.specialization,
    profileImage: caretaker.profileImage,
    modality: caretaker.modality || '',
    dateProvided: caretaker.dateProvided ? 
      (typeof caretaker.dateProvided === 'string' ? caretaker.dateProvided : 
        caretaker.dateProvided.toISOString()) : 
      new Date().toISOString()
  };
};

export const adaptAssessmentToComponent = (assessment: PerformanceAssessmentType): ComponentPerformanceAssessment => {
  const assessmentDate = assessment.assessmentDate instanceof Date ? 
    assessment.assessmentDate : 
    new Date(assessment.assessmentDate || Date.now());
  
  const date = assessment.date instanceof Date ? 
    assessment.date : 
    new Date(assessment.date || Date.now());
  
  return {
    _id: assessment._id,
    id: assessment.id || assessment._id,
    caretakerId: assessment.caretakerId,
    rating: assessment.rating,
    categories: assessment.categories,
    assessmentDate: assessmentDate,
    assessedBy: assessment.assessedBy || 'Unknown',
    notes: assessment.notes,
    date: date,
    createdAt: assessment.createdAt instanceof Date ? assessment.createdAt : 
              assessment.createdAt ? new Date(assessment.createdAt) : undefined,
    updatedAt: assessment.updatedAt instanceof Date ? assessment.updatedAt : 
               assessment.updatedAt ? new Date(assessment.updatedAt) : undefined,
    assessorRole: assessment.assessorRole,
    overallScore: assessment.overallScore,
    comments: assessment.comments,
    recommendations: assessment.recommendations,
    status: assessment.status
  };
};

// Convert arrays
export const adaptCaretakersArray = (caretakers: PerformanceCaretaker[]): ComponentCaretaker[] => {
  return caretakers.map(adaptCaretakerToComponent);
};

export const adaptAssessmentsArray = (assessments: PerformanceAssessmentType[]): ComponentPerformanceAssessment[] => {
  return assessments.map(adaptAssessmentToComponent);
};