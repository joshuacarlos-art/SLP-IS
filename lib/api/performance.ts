import { Caretaker, PerformanceAssessment } from '@/types/performance';

const API_BASE = '/api';

export const performanceApi = {
  // Caretakers
  async getCaretakers(): Promise<Caretaker[]> {
    const response = await fetch(`${API_BASE}/performance/caretakers`);
    if (!response.ok) throw new Error('Failed to fetch caretakers');
    const data = await response.json();
    return data.map(transformCaretakerData);
  },

  async getCaretakerById(id: string): Promise<Caretaker> {
    const response = await fetch(`${API_BASE}/performance/caretakers/${id}`);
    if (!response.ok) throw new Error('Failed to fetch caretaker');
    const data = await response.json();
    return transformCaretakerData(data);
  },

  // Assessments
  async getAssessments(): Promise<PerformanceAssessment[]> {
    const response = await fetch(`${API_BASE}/performance/assessments`);
    if (!response.ok) throw new Error('Failed to fetch assessments');
    const data = await response.json();
    return data.map(transformAssessmentData);
  },

  async getCaretakerAssessments(caretakerId: string): Promise<PerformanceAssessment[]> {
    const response = await fetch(`${API_BASE}/performance/assessments?caretakerId=${caretakerId}`);
    if (!response.ok) throw new Error('Failed to fetch caretaker assessments');
    const data = await response.json();
    return data.map(transformAssessmentData);
  },

  async createAssessment(data: Omit<PerformanceAssessment, 'id' | '_id'>): Promise<PerformanceAssessment> {
    const response = await fetch(`${API_BASE}/performance/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create assessment');
    const result = await response.json();
    return transformAssessmentData(result);
  },

  // ... rest of the functions
};

// Utility functions for data transformation
export const transformCaretakerData = (data: any): Caretaker => ({
  _id: data._id,
  id: data.id || data._id,
  firstName: data.firstName || '',
  lastName: data.lastName || '',
  middleName: data.middleName || '',
  extension: data.extension || '',
  participantType: data.participantType || '',
  sex: data.sex || '',
  isLGBTQMember: data.isLGBTQMember || false,
  contactNumber: data.contactNumber || '',
  slpAssociation: data.slpAssociation || '',
  houseLotNo: data.houseLotNo || '',
  street: data.street || '',
  barangay: data.barangay || '',
  cityMunicipality: data.cityMunicipality || '',
  province: data.province || '',
  region: data.region || '',
  slpaName: data.slpaName || '',
  slpaDesignation: data.slpaDesignation || '',
  modality: data.modality || '',
  dateProvided: data.dateProvided || '',
  status: data.status || 'active',
  profilePhoto: data.profilePhoto || '',
  createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  fullName: data.fullName || '',
  email: data.email || '',
  dateStarted: data.dateStarted || '',
  performanceScore: data.performanceScore || 0,
  totalAssessments: data.totalAssessments || 0,
  lastAssessment: data.lastAssessment ? new Date(data.lastAssessment) : undefined,
  rank: data.rank || 0
});

export const transformAssessmentData = (data: any): PerformanceAssessment => ({
  _id: data._id,
  id: data.id || data._id,
  caretakerId: data.caretakerId,
  assessmentDate: data.assessmentDate ? new Date(data.assessmentDate) : new Date(),
  date: data.date ? new Date(data.date) : new Date(),
  rating: data.rating || 0,
  comments: data.comments || '',
  areasOfImprovement: data.areasOfImprovement || [],
  strengths: data.strengths || [],
  assessedBy: data.assessedBy || '',
  reviewer: data.reviewer || '',
  categories: data.categories || {
    punctuality: data.rating || 0,
    communication: data.rating || 0,
    patientCare: data.rating || 0,
    professionalism: data.rating || 0,
    technicalSkills: data.rating || 0
  },
  createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
});