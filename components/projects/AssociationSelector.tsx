// components/projects/AssociationSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Association } from '@/types/project';

interface AssociationSelectorProps {
  value: string;
  onChange: (associationId: string) => void;
  required?: boolean;
}

export function AssociationSelector({ value, onChange, required = false }: AssociationSelectorProps) {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const response = await fetch('/api/associations');
        if (response.ok) {
          const data = await response.json();
          const activeAssociations = data.filter((assoc: Association) => 
            !assoc.archived && assoc.status === 'active'
          );
          setAssociations(activeAssociations);
        }
      } catch (error) {
        console.error('Error fetching associations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssociations();
  }, []);

  if (isLoading) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Association
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label htmlFor="associationId" className="block text-sm font-medium text-gray-700 mb-2">
        Select Association {required && '*'}
      </label>
      <select
        id="associationId"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select an Association</option>
        {associations.map((association) => (
          <option key={association._id} value={association._id}>
            {association.name} - {association.location} ({association.no_active_members} active members)
          </option>
        ))}
      </select>
      <p className="mt-1 text-sm text-gray-500">
        Choose the association this project belongs to. Only active associations are shown.
      </p>
    </div>
  );
}