// hooks/useCaretakerFilters.ts
import { useState, useMemo, useCallback } from 'react';
import type { Caretaker } from '@/components/caretaker/types';
import { getFullName } from '@/components/caretaker/types';

export type StatusFilter = 'all' | 'active' | 'on-leave' | 'on_leave' | 'inactive';

interface UseCaretakerFiltersReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  filteredCaretakers: Caretaker[];
  clearFilters: () => void;
}

export const useCaretakerFilters = (caretakers: Caretaker[]): UseCaretakerFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredCaretakers,
    clearFilters
  };
};