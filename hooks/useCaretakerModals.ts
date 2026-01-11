// hooks/useCaretakerModals.ts
import { useState, useCallback } from 'react';
import type { Caretaker, CaretakerFormData } from '@/components/caretaker/types';

interface UseCaretakerModalsReturn {
  selectedCaretaker: Caretaker | null;
  isAssessmentModalOpen: boolean;
  isAddModalOpen: boolean;
  openAssessmentModal: (caretaker: Caretaker) => void;
  closeAssessmentModal: () => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  handleAddCaretaker: (caretakerData: CaretakerFormData) => Promise<void>;
}

export const useCaretakerModals = (
  caretakers: Caretaker[],
  setCaretakers: (caretakers: Caretaker[]) => void,
  setError: (error: string | null) => void
): UseCaretakerModalsReturn => {
  const [selectedCaretaker, setSelectedCaretaker] = useState<Caretaker | null>(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const openAssessmentModal = useCallback((caretaker: Caretaker) => {
    setSelectedCaretaker(caretaker);
    setIsAssessmentModalOpen(true);
  }, []);

  const closeAssessmentModal = useCallback(() => {
    setIsAssessmentModalOpen(false);
    setSelectedCaretaker(null);
  }, []);

  const openAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleAddCaretaker = useCallback(async (caretakerData: CaretakerFormData) => {
    try {
      setError(null);
      
      // Validation
      if (!caretakerData.firstName?.trim() || !caretakerData.lastName?.trim()) {
        throw new Error('First name and last name are required');
      }

      const newCaretaker: Caretaker = {
        ...caretakerData,
        id: `CT${Date.now().toString().slice(-6)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        email: `${caretakerData.firstName.toLowerCase()}.${caretakerData.lastName.toLowerCase()}@care.com`,
        dateStarted: new Date().toISOString().split('T')[0]
      };

      const response = await fetch('/api/caretakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCaretaker),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save caretaker: ${response.status}`);
      }

      const result = await response.json();
      setCaretakers([...caretakers, result.caretaker]);
      closeAddModal();
      
    } catch (error) {
      console.error('Error adding caretaker:', error);
      setError(error instanceof Error ? error.message : 'Failed to add caretaker');
      throw error; // Re-throw to let component handle it
    }
  }, [caretakers, setCaretakers, setError, closeAddModal]);

  return {
    selectedCaretaker,
    isAssessmentModalOpen,
    isAddModalOpen,
    openAssessmentModal,
    closeAssessmentModal,
    openAddModal,
    closeAddModal,
    handleAddCaretaker
  };
};