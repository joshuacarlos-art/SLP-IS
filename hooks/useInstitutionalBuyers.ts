import { useState, useCallback } from 'react';
import { 
  InstitutionalBuyer, 
  ProjectBuyer, 
  BuyerStats, 
  BuyerFormData,
  InstitutionalBuyerInput 
} from '@/types/institutionalBuyers';

export const useInstitutionalBuyers = () => {
  const [buyers, setBuyers] = useState<InstitutionalBuyer[]>([]);
  const [projectBuyers, setProjectBuyers] = useState<ProjectBuyer[]>([]);
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const calculateStats = useCallback((buyersData: InstitutionalBuyer[]) => {
    const totalBuyers = buyersData.length;
    const activeBuyers = buyersData.filter(buyer => buyer.status === 'active').length;
    const draftBuyers = buyersData.filter(buyer => buyer.status === 'draft').length; // Changed from inactiveBuyers to draftBuyers
    
    const typeCounts = buyersData.reduce((acc, buyer) => {
      acc[buyer.type] = (acc[buyer.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const buyersByType = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count
    }));

    setStats({
      totalBuyers,
      activeBuyers,
      draftBuyers, // Updated to use draftBuyers
      buyersByType
    });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      const response = await fetch('/api/institutional-buyers');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch buyers: ${response.status}`);
      }

      const buyersData = await response.json();
      setBuyers(buyersData);
      calculateStats(buyersData);
      
    } catch (error: any) {
      console.error('❌ Error fetching data:', error);
      setConnectionError(error.message || 'Cannot connect to database. Please check your connection.');
      
      setBuyers([]);
      setStats({
        totalBuyers: 0,
        activeBuyers: 0,
        draftBuyers: 0, // Updated to use draftBuyers
        buyersByType: []
      });
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  const fetchProjectBuyers = useCallback(async () => {
    try {
      const response = await fetch('/api/project-buyers');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch project buyers: ${response.status}`);
      }

      const projectBuyersData = await response.json();
      setProjectBuyers(projectBuyersData);
      
    } catch (error: any) {
      console.error('❌ Error fetching project buyers:', error);
    }
  }, []);

  const createBuyer = useCallback(async (formData: BuyerFormData) => {
    const response = await fetch('/api/institutional-buyers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return response.json();
  }, []);

  const updateBuyer = useCallback(async (buyerId: string, formData: BuyerFormData) => {
    const response = await fetch(`/api/institutional-buyers?id=${buyerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return response.json();
  }, []);

  const deleteBuyer = useCallback(async (buyerId: string) => {
    const response = await fetch(`/api/institutional-buyers?id=${buyerId}`, {
      method: 'DELETE'
    });
    return response.json();
  }, []);

  return {
    buyers,
    projectBuyers,
    stats,
    loading,
    connectionError,
    fetchData,
    fetchProjectBuyers,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    setBuyers
  };
};