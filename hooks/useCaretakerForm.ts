// hooks/useCaretakerForm.ts
import { useState, useCallback } from 'react';
import { CaretakerFormData } from '@/components/caretaker/types';

const initialFormData: CaretakerFormData = {
  firstName: '',
  lastName: '',
  middleName: '',
  extension: '',
  participantType: '',
  sex: '',
  contactNumber: '',
  slpAssociation: '',
  houseLotNo: '',
  street: '',
  barangay: '',
  cityMunicipality: '',
  province: '',
  region: '',
  slpaName: '',
  slpaDesignation: '',
  modality: '',
  dateProvided: '',
  status: 'active'
};

export const useCaretakerForm = (onAddCaretaker: (data: CaretakerFormData) => void) => {
  const [formData, setFormData] = useState<CaretakerFormData>(initialFormData);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onAddCaretaker(formData);
    setFormData(initialFormData);
  }, [formData, onAddCaretaker]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  return {
    formData,
    handleSubmit,
    handleChange,
    resetForm
  };
};