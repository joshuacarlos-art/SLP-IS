// hooks/useCaretakers.ts
import { useState, useEffect } from 'react';
import type { Caretaker, PerformanceAssessment } from '@/components/caretaker/types';

interface UseCaretakersReturn {
  caretakers: Caretaker[];
  assessments: PerformanceAssessment[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useCaretakers = (): UseCaretakersReturn => {
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
  const [assessments, setAssessments] = useState<PerformanceAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [caretakersRes, assessmentsRes] = await Promise.allSettled([
        fetch('/api/caretakers'),
        fetch('/api/assessments')
      ]);

      // Handle caretakers response
      if (caretakersRes.status === 'fulfilled' && caretakersRes.value.ok) {
        const caretakersData = await caretakersRes.value.json();
        setCaretakers(caretakersData);
      } else if (caretakersRes.status === 'fulfilled') {
        throw new Error(`Failed to fetch caretakers: ${caretakersRes.value.status}`);
      }

      // Handle assessments response
      if (assessmentsRes.status === 'fulfilled' && assessmentsRes.value.ok) {
        const assessmentsData = await assessmentsRes.value.json();
        setAssessments(assessmentsData);
      } else if (assessmentsRes.status === 'fulfilled' && assessmentsRes.value.status !== 404) {
        console.warn('Could not fetch assessments:', assessmentsRes.value.status);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    caretakers,
    assessments,
    loading,
    error,
    refreshData
  };
};