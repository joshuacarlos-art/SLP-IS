import { PerformanceAssessment, AssessmentSummary } from './types';

export const mockAssessments: PerformanceAssessment[] = [
  {
    id: '1',
    _id: '1',
    caretakerId: '1',
    assessmentDate: new Date('2024-01-15'),
    date: new Date('2024-01-15'),
    rating: 4.5,
    comments: 'Excellent performance this quarter. Shows great initiative and care for the animals.',
    assessedBy: 'Farm Manager',
    reviewer: 'Farm Manager',
    categories: {
      punctuality: 5,
      communication: 4,
      patientCare: 5,
      professionalism: 4,
      technicalSkills: 5
    },
    strengths: ['Animal care', 'Technical knowledge'],
    areasOfImprovement: ['Documentation']
  },
  {
    id: '2',
    _id: '2',
    caretakerId: '1',
    assessmentDate: new Date('2023-10-20'),
    date: new Date('2023-10-20'),
    rating: 4.0,
    comments: 'Good overall performance. Could improve on communication with team members.',
    assessedBy: 'Senior Caretaker',
    reviewer: 'Senior Caretaker',
    categories: {
      punctuality: 4,
      communication: 3,
      patientCare: 4,
      professionalism: 4,
      technicalSkills: 5
    },
    strengths: ['Technical skills', 'Reliability'],
    areasOfImprovement: ['Team communication']
  }
];

export const mockAssessmentSummary: AssessmentSummary = {
  averageRating: 4.25,
  totalAssessments: 2,
  categoryAverages: {
    punctuality: 4.5,
    communication: 3.5,
    patientCare: 4.5,
    professionalism: 4.0,
    technicalSkills: 5.0
  },
  performanceLevel: 'Very Good'
};