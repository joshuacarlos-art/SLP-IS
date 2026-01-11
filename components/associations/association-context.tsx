'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Association } from '@/types/database';

// Create context for sharing association data
interface AssociationContextType {
  associations: Association[];
  fetchAssociations: () => Promise<void>;
  updateAssociationMemberCount: (associationId: string, increment?: boolean) => Promise<void>;
  getActiveAssociations: () => Association[];
}

const AssociationContext = createContext<AssociationContextType | undefined>(undefined);

// Hook to use association context
export const useAssociations = () => {
  const context = useContext(AssociationContext);
  if (context === undefined) {
    throw new Error('useAssociations must be used within an AssociationProvider');
  }
  return context;
};

// Association Provider component
interface AssociationProviderProps {
  children: ReactNode;
}

export const AssociationProvider: React.FC<AssociationProviderProps> = ({ children }) => {
  const [associations, setAssociations] = useState<Association[]>([]);

  const fetchAssociations = async () => {
    try {
      console.log('🔄 Fetching associations from /api/associations...');
      
      const response = await fetch('/api/associations');
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Received associations data:', data);
      console.log('🔢 Number of associations:', data.length);
      
      setAssociations(data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching associations:', error);
      throw error;
    }
  };

  const updateAssociationMemberCount = async (associationId: string, increment: boolean = true) => {
    try {
      const association = associations.find(assoc => assoc._id === associationId);
      if (!association) {
        console.error('Association not found:', associationId);
        return;
      }

      const newMemberCount = increment 
        ? (association.no_active_members || 0) + 1
        : Math.max(0, (association.no_active_members || 0) - 1);

      const response = await fetch(`/api/associations/id?id=${associationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...association,
          no_active_members: newMemberCount
        }),
      });

      if (response.ok) {
        // Update local state
        setAssociations(prev => 
          prev.map(assoc => 
            assoc._id === associationId 
              ? { ...assoc, no_active_members: newMemberCount }
              : assoc
          )
        );
        console.log(`✅ Association member count ${increment ? 'incremented' : 'decremented'} successfully`);
      } else {
        console.error('Failed to update association member count');
        throw new Error('Failed to update association member count');
      }
    } catch (error) {
      console.error('Error updating association member count:', error);
      throw error;
    }
  };

  const getActiveAssociations = () => {
    return associations.filter(assoc => !assoc.archived && assoc.status === 'active');
  };

  return (
    <AssociationContext.Provider value={{
      associations,
      fetchAssociations,
      updateAssociationMemberCount,
      getActiveAssociations
    }}>
      {children}
    </AssociationContext.Provider>
  );
};