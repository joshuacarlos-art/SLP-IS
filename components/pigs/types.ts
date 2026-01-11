export interface Pig {
  _id?: string;
  id: string;
  participantId: string;
  participantName: string;
  project: string;
  tagNumber: string;
  breed: string;
  sex?: 'Male' | 'Female' | 'Unknown';
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  feedingSchedule: string;
  breedingStatus: 'Not Ready' | 'Ready' | 'Pregnant' | 'Lactating' | 'Weaned';
  weight: number;
  dateOfBirth?: Date;
  dateAcquired?: Date;
  lastVetVisit?: Date;
  nextVetVisit?: Date;
  notes?: string;
  caretakerId: string;
  caretakerName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PigFormData {
  participantId: string;
  participantName: string;
  project: string;
  tagNumber: string;
  breed: string;
  sex?: 'Male' | 'Female' | 'Unknown';
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  feedingSchedule: string;
  breedingStatus: 'Not Ready' | 'Ready' | 'Pregnant' | 'Lactating' | 'Weaned';
  weight: number;
  dateOfBirth?: Date;
  dateAcquired?: Date;
  lastVetVisit?: Date;
  nextVetVisit?: Date;
  notes?: string;
  caretakerId: string;
  caretakerName: string;
}