// hooks/useAssessmentCalculations.ts
import { useMemo } from 'react';
import { PerformanceAssessment, AssessmentSummary } from '@/components/caretaker/types';

export const useAssessmentCalculations = (
  assessments: PerformanceAssessment[], 
  assessmentSummary: AssessmentSummary | null
) => {
  const calculateSummary = useMemo((): AssessmentSummary => {
    if (assessmentSummary) return assessmentSummary;

    if (assessments.length === 0) {
      return {
        averageRating: 0,
        totalAssessments: 0,
        categoryAverages: {
          punctuality: 0,
          communication: 0,
          patientCare: 0,
          professionalism: 0,
          technicalSkills: 0,
        },
        performanceLevel: 'No Data'
      };
    }

    const totalRating = assessments.reduce((sum, assessment) => sum + assessment.rating, 0);
    const averageRating = totalRating / assessments.length;

    const categorySums = assessments.reduce((acc, assessment) => {
      const categories = assessment.categories || {
        punctuality: assessment.rating,
        communication: assessment.rating,
        patientCare: assessment.rating,
        professionalism: assessment.rating,
        technicalSkills: assessment.rating
      };

      return {
        punctuality: acc.punctuality + categories.punctuality,
        communication: acc.communication + categories.communication,
        patientCare: acc.patientCare + categories.patientCare,
        professionalism: acc.professionalism + categories.professionalism,
        technicalSkills: acc.technicalSkills + categories.technicalSkills,
      };
    }, {
      punctuality: 0,
      communication: 0,
      patientCare: 0,
      professionalism: 0,
      technicalSkills: 0,
    });

    const getPerformanceLevel = (rating: number): string => {
      if (rating >= 4.5) return 'Excellent';
      if (rating >= 4.0) return 'Very Good';
      if (rating >= 3.5) return 'Good';
      if (rating >= 3.0) return 'Satisfactory';
      return 'Needs Improvement';
    };

    return {
      averageRating,
      totalAssessments: assessments.length,
      categoryAverages: {
        punctuality: categorySums.punctuality / assessments.length,
        communication: categorySums.communication / assessments.length,
        patientCare: categorySums.patientCare / assessments.length,
        professionalism: categorySums.professionalism / assessments.length,
        technicalSkills: categorySums.technicalSkills / assessments.length,
      },
      performanceLevel: getPerformanceLevel(averageRating)
    };
  }, [assessments, assessmentSummary]);

  const hasCategoryData = (summary: AssessmentSummary): boolean => {
    const { categoryAverages } = summary;
    return Object.values(categoryAverages).some(value => value > 0);
  };

  const getReviewerName = (assessment: PerformanceAssessment): string => {
    return assessment.reviewer || assessment.assessedBy || 'Unknown Reviewer';
  };

  const getAssessmentDate = (assessment: PerformanceAssessment): Date | string | undefined => {
    return assessment.date || assessment.assessmentDate;
  };

  const getAssessmentId = (assessment: PerformanceAssessment): string => {
    return assessment.id || assessment._id || `assessment-${Math.random().toString(36).substr(2, 9)}`;
  };

  return {
    summary: calculateSummary,
    hasCategoryData,
    getReviewerName,
    getAssessmentDate,
    getAssessmentId
  };
};