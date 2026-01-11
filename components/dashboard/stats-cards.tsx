"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PiggyBank, Building2, TrendingUp, Loader2 } from "lucide-react";
import { logSuccess } from "@/lib/activity/activity-logger";

interface StatsCardsProps {
  data?: {
    totalAssociations?: number;
    totalMembers?: number;
    totalPigs?: number;
    growthRate?: number;
  };
}

export default function StatsCards({ data }: StatsCardsProps) {
  const [stats, setStats] = useState({
    totalAssociations: 0,
    totalMembers: 0,
    totalPigs: 0,
    growthRate: 0
  });
  const [isLoading, setIsLoading] = useState(!data);

  useEffect(() => {
    if (data) {
      setStats({
        totalAssociations: data.totalAssociations ?? 0,
        totalMembers: data.totalMembers ?? 0,
        totalPigs: data.totalPigs ?? 0,
        growthRate: data.growthRate ?? 0,
      });
      setIsLoading(false);
    } else {
      fetchStats();
    }
  }, [data]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/associations/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        
        // Log successful stats fetch
        await logSuccess(
          'Dashboard',
          'FETCH_STATISTICS',
          'Successfully loaded dashboard statistics from API',
          undefined,
          { 
            associations: data.totalAssociations,
            members: data.totalMembers,
            pigs: data.totalPigs,
            growthRate: data.growthRate
          }
        );
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Log error fetching stats
      await logSuccess(
        'Dashboard',
        'FETCH_STATISTICS_ERROR',
        'Failed to load dashboard statistics',
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatClick = async (statName: string, value: string | number) => {
    try {
      await logSuccess(
        'Dashboard',
        'VIEW_STAT_DETAILS',
        `Clicked on ${statName} statistic with value: ${value}`,
        undefined,
        { statName, value }
      );
    } catch (error) {
      console.error('Failed to log stat click:', error);
    }
  };

  const cards = [
    {
      title: "Total Associations",
      value: stats.totalAssociations,
      icon: Building2,
      description: "Registered associations",
      color: "text-blue-600",
      onClick: () => handleStatClick("Total Associations", stats.totalAssociations)
    },
    {
      title: "Total Members",
      value: stats.totalMembers.toLocaleString(),
      icon: Users,
      description: "Active members",
      color: "text-green-600",
      onClick: () => handleStatClick("Total Members", stats.totalMembers)
    },
    {
      title: "Total Pigs",
      value: stats.totalPigs.toLocaleString(),
      icon: PiggyBank,
      description: "Registered pigs",
      color: "text-orange-600",
      onClick: () => handleStatClick("Total Pigs", stats.totalPigs)
    },
    {
      title: "Growth Rate",
      value: `${stats.growthRate}%`,
      icon: TrendingUp,
      description: "This month",
      color: stats.growthRate >= 0 ? "text-green-600" : "text-red-600",
      onClick: () => handleStatClick("Growth Rate", `${stats.growthRate}%`)
    }
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={card.onClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}