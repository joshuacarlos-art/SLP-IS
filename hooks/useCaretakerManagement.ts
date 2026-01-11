import { useState, useMemo, useEffect, useCallback } from 'react';
import type { 
  Caretaker, 
  PerformanceAssessment, 
  AssessmentSummary,
  CaretakerFormData 
} from '@/components/caretaker/types';
import { getFullName } from '@/components/caretaker/types';

export type StatusFilter = 'all' | 'active' | 'on-leave' | 'on_leave' | 'inactive';

export const useCaretakerManagement = () => {
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
  const [assessments, setAssessments] = useState<PerformanceAssessment[]>([]);
  const [selectedCaretaker, setSelectedCaretaker] = useState<Caretaker | null>(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch caretakers and assessments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        // Fetch caretakers
        const caretakersResponse = await fetch('/api/caretakers');
        if (!caretakersResponse.ok) {
          throw new Error(`Failed to fetch caretakers: ${caretakersResponse.status}`);
        }
        const caretakersData = await caretakersResponse.json();
        setCaretakers(caretakersData);

        // Fetch assessments - handle 404 gracefully
        try {
          const assessmentsResponse = await fetch('/api/assessments');
          if (assessmentsResponse.ok) {
            const assessmentsData = await assessmentsResponse.json();
            setAssessments(assessmentsData);
          } else if (assessmentsResponse.status === 404) {
            // Assessments API not implemented yet, use empty array
            console.log('Assessments API not available, using empty array');
            setAssessments([]);
          } else {
            throw new Error(`Failed to fetch assessments: ${assessmentsResponse.status}`);
          }
        } catch (assessmentsError) {
          console.warn('Could not fetch assessments:', assessmentsError);
          setAssessments([]); // Use empty array if assessments fail
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered caretakers
  const filteredCaretakers = useMemo(() => {
    return caretakers.filter(caretaker => {
      const fullName = getFullName(caretaker);
      const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (caretaker.id && caretaker.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (caretaker.email && caretaker.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || caretaker.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [caretakers, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = caretakers.length;
    const active = caretakers.filter(c => c.status === 'active').length;
    const onLeave = caretakers.filter(c => c.status === 'on-leave' || c.status === 'on_leave').length;
    const inactive = caretakers.filter(c => c.status === 'inactive').length;

    return { total, active, onLeave, inactive };
  }, [caretakers]);

  // Assessment calculations
  const calculateAssessmentSummary = useCallback((caretakerId: string): AssessmentSummary => {
    const caretakerAssessments = assessments.filter(a => a.caretakerId === caretakerId);
    
    if (caretakerAssessments.length === 0) {
      return {
        averageRating: 0,
        totalAssessments: 0,
        categoryAverages: {
          punctuality: 0,
          communication: 0,
          patientCare: 0,
          professionalism: 0,
          technicalSkills: 0
        },
        performanceLevel: 'No Data'
      };
    }

    const totalRating = caretakerAssessments.reduce((sum, a) => sum + a.rating, 0);
    const averageRating = totalRating / caretakerAssessments.length;

    const categorySums = {
      punctuality: 0,
      communication: 0,
      patientCare: 0,
      professionalism: 0,
      technicalSkills: 0
    };

    caretakerAssessments.forEach(assessment => {
      const categories = assessment.categories || {
        punctuality: assessment.rating,
        communication: assessment.rating,
        patientCare: assessment.rating,
        professionalism: assessment.rating,
        technicalSkills: assessment.rating
      };

      categorySums.punctuality += categories.punctuality;
      categorySums.communication += categories.communication;
      categorySums.patientCare += categories.patientCare;
      categorySums.professionalism += categories.professionalism;
      categorySums.technicalSkills += categories.technicalSkills;
    });

    const categoryAverages = {
      punctuality: categorySums.punctuality / caretakerAssessments.length,
      communication: categorySums.communication / caretakerAssessments.length,
      patientCare: categorySums.patientCare / caretakerAssessments.length,
      professionalism: categorySums.professionalism / caretakerAssessments.length,
      technicalSkills: categorySums.technicalSkills / caretakerAssessments.length
    };

    const performanceLevel = averageRating >= 4.5 ? 'Excellent' :
                           averageRating >= 4.0 ? 'Very Good' :
                           averageRating >= 3.5 ? 'Good' :
                           averageRating >= 3.0 ? 'Satisfactory' : 'Needs Improvement';

    return {
      averageRating,
      totalAssessments: caretakerAssessments.length,
      categoryAverages,
      performanceLevel
    };
  }, [assessments]);

  // Get caretaker assessments
  const getCaretakerAssessments = useCallback((caretakerId: string): PerformanceAssessment[] => {
    return assessments.filter(a => a.caretakerId === caretakerId);
  }, [assessments]);

  // Handlers
  const handleAddCaretaker = async (caretakerData: CaretakerFormData) => {
    try {
      setError(null);
      
      // Generate unique ID
      const newCaretaker: Caretaker = {
        ...caretakerData,
        id: `CT${Date.now().toString().slice(-6)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        email: `${caretakerData.firstName.toLowerCase()}.${caretakerData.lastName.toLowerCase()}@care.com`,
        dateStarted: new Date().toISOString().split('T')[0]
      };

      // Save to MongoDB
      const response = await fetch('/api/caretakers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCaretaker),
      });

      if (response.ok) {
        const result = await response.json();
        setCaretakers(prev => [...prev, result.caretaker]);
        setIsAddModalOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save caretaker: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding caretaker:', error);
      setError(error instanceof Error ? error.message : 'Failed to add caretaker');
    }
  };

  const handleViewAssessment = (caretakerId: string) => {
    const caretaker = caretakers.find(c => c.id === caretakerId);
    if (caretaker) {
      setSelectedCaretaker(caretaker);
      setIsAssessmentModalOpen(true);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const closeAssessmentModal = () => setIsAssessmentModalOpen(false);
  const clearError = () => setError(null);

  return {
    // State
    caretakers,
    assessments,
    selectedCaretaker,
    filteredCaretakers,
    stats,
    loading,
    error,
    searchTerm,
    statusFilter,
    isAssessmentModalOpen,
    isAddModalOpen,

    // Actions
    setSearchTerm,
    setStatusFilter,
    handleAddCaretaker,
    handleViewAssessment,
    handleRetry,
    openAddModal,
    closeAddModal,
    closeAssessmentModal,
    clearError,

    // Calculations
    calculateAssessmentSummary,
    getCaretakerAssessments,
  };
};