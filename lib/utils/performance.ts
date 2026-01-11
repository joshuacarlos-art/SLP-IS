// Define types locally to avoid import errors
interface Caretaker {
  _id?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  extension?: string;
  phone?: string;
  email?: string;
  status?: string;
  [key: string]: unknown;
}

interface PerformanceAssessment {
  _id?: string;
  caretakerId: string;
  rating: number;
  categories?: PerformanceCategoryScores;
  [key: string]: unknown;
}

interface PerformanceCategoryScores {
  punctuality: number;
  communication: number;
  patientCare: number;
  professionalism: number;
  technicalSkills: number;
}

type PerformanceLevel = 'excellent' | 'very-good' | 'good' | 'satisfactory' | 'needs-improvement';

export const getFullName = (caretaker: Caretaker | null | undefined): string => {
  if (!caretaker) return 'Unknown';
  
  let fullName = `${caretaker.firstName || ''} ${caretaker.lastName || ''}`.trim();
  
  if (caretaker.middleName) {
    fullName = `${caretaker.firstName || ''} ${caretaker.middleName} ${caretaker.lastName || ''}`.trim();
  }
  
  if (caretaker.extension) {
    fullName = `${fullName}, ${caretaker.extension}`;
  }
  
  return fullName || 'Unknown';
};

export const calculatePerformanceScore = (assessments: PerformanceAssessment[]): {
  averageRating: number;
  score: number;
  level: PerformanceLevel;
  categoryAverages: PerformanceCategoryScores;
} => {
  if (assessments.length === 0) {
    return {
      averageRating: 0,
      score: 0,
      level: 'needs-improvement',
      categoryAverages: {
        punctuality: 0,
        communication: 0,
        patientCare: 0,
        professionalism: 0,
        technicalSkills: 0
      }
    };
  }

  const totalRating = assessments.reduce((sum, a) => sum + (a.rating || 0), 0);
  const averageRating = totalRating / assessments.length;
  const score = averageRating * 20;
  
  const categoryTotals: PerformanceCategoryScores = {
    punctuality: 0,
    communication: 0,
    patientCare: 0,
    professionalism: 0,
    technicalSkills: 0
  };
  
  let assessmentCountWithCategories = 0;
  
  assessments.forEach(assessment => {
    const categories = assessment.categories || {
      punctuality: assessment.rating || 0,
      communication: assessment.rating || 0,
      patientCare: assessment.rating || 0,
      professionalism: assessment.rating || 0,
      technicalSkills: assessment.rating || 0
    };
    
    if (assessment.categories) {
      assessmentCountWithCategories++;
    }
    
    Object.keys(categoryTotals).forEach(key => {
      const categoryKey = key as keyof PerformanceCategoryScores;
      categoryTotals[categoryKey] += categories[categoryKey] || 0;
    });
  });
  
  const effectiveAssessmentCount = assessmentCountWithCategories > 0 
    ? assessmentCountWithCategories 
    : assessments.length;
  
  const categoryAverages: PerformanceCategoryScores = {
    punctuality: effectiveAssessmentCount > 0 ? categoryTotals.punctuality / effectiveAssessmentCount : 0,
    communication: effectiveAssessmentCount > 0 ? categoryTotals.communication / effectiveAssessmentCount : 0,
    patientCare: effectiveAssessmentCount > 0 ? categoryTotals.patientCare / effectiveAssessmentCount : 0,
    professionalism: effectiveAssessmentCount > 0 ? categoryTotals.professionalism / effectiveAssessmentCount : 0,
    technicalSkills: effectiveAssessmentCount > 0 ? categoryTotals.technicalSkills / effectiveAssessmentCount : 0
  };

  const level: PerformanceLevel = averageRating >= 4.5 ? 'excellent' :
                                  averageRating >= 4.0 ? 'very-good' :
                                  averageRating >= 3.5 ? 'good' :
                                  averageRating >= 3.0 ? 'satisfactory' : 'needs-improvement';

  return {
    averageRating,
    score,
    level,
    categoryAverages
  };
};

export const getPerformanceLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Satisfactory';
  return 'Needs Improvement';
};

export const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

export const getBadgeColor = (score: number): string => {
  if (score >= 90) return 'bg-green-100 text-green-800';
  if (score >= 80) return 'bg-blue-100 text-blue-800';
  if (score >= 70) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export const getStatusColor = (status: string | undefined): string => {
  if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'active') return 'bg-green-100 text-green-800 border-green-200';
  if (lowerStatus === 'on-leave' || lowerStatus === 'on_leave') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (lowerStatus === 'inactive') return 'bg-red-100 text-red-800 border-red-200';
  
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

export const formatStatus = (status: string | undefined): string => {
  if (!status) return 'Unknown';
  
  const formatted = status.replace(/[-_]/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const getRankColor = (rank: number): string => {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-yellow-300';
  if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-300';
  if (rank === 3) return 'bg-gradient-to-r from-amber-700 to-amber-500';
  return 'bg-gradient-to-r from-blue-500 to-blue-300';
};