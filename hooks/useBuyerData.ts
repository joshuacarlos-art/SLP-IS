import { useState, useCallback } from 'react';
import { InstitutionalBuyer, ProjectBuyer, BuyerStats } from '@/types/institutionalBuyers';
import { logSuccess, logError } from '@/lib/activity/activity-logger';

export const useBuyerData = () => {
  const [buyers, setBuyers] = useState<InstitutionalBuyer[]>([]);
  const [projectBuyers, setProjectBuyers] = useState<ProjectBuyer[]>([]);
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const calculateStats = useCallback((buyersData: InstitutionalBuyer[]) => {
    const totalBuyers = buyersData.length;
    const activeBuyers = buyersData.filter(buyer => buyer.status === 'active').length;
    const inactiveBuyers = totalBuyers - activeBuyers;
    
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
      inactiveBuyers,
      buyersByType
    });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      await logSuccess(
        'Institutional Buyers',
        'FETCH_DATA_START',
        'Started fetching institutional buyers data'
      );

      const response = await fetch('/api/institutional-buyers');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch buyers: ${response.status}`);
      }

      const buyersData = await response.json();
      
      setBuyers(buyersData);
      calculateStats(buyersData);
      
      await logSuccess(
        'Institutional Buyers',
        'FETCH_DATA_SUCCESS',
        `Successfully loaded ${buyersData.length} institutional buyers`,
        undefined,
        { buyerCount: buyersData.length }
      );
      
    } catch (error: any) {
      console.error('❌ Error fetching data:', error);
      setConnectionError(error.message || 'Cannot connect to database. Please check your connection.');
      
      setBuyers([]);
      setStats({
        totalBuyers: 0,
        activeBuyers: 0,
        inactiveBuyers: 0,
        buyersByType: []
      });

      await logError(
        'Institutional Buyers',
        'FETCH_DATA_ERROR',
        `Failed to fetch buyers data: ${error.message || 'Unknown error'}`,
        undefined,
        { error: error.message || 'Unknown error' }
      );
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
      
      await logError(
        'Institutional Buyers',
        'FETCH_PROJECT_BUYERS_ERROR',
        `Failed to fetch project buyers: ${error.message || 'Unknown error'}`,
        undefined,
        { error: error.message || 'Unknown error' }
      );
    }
  }, []);

  return {
    buyers,
    projectBuyers,
    stats,
    loading,
    connectionError,
    fetchData,
    fetchProjectBuyers,
    setBuyers
  };
};