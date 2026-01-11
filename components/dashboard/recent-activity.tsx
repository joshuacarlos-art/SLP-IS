"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, AlertTriangle, Info, RefreshCw } from "lucide-react";
import { activityLogger, logSuccess } from "@/lib/activity/activity-logger";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  type: "success" | "warning" | "info";
  icon: any;
  message: string;
  time: string;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRecentActivities();
  }, []);

  const loadRecentActivities = () => {
    // Get recent activities from the activity logger
    const recentLogs = activityLogger.getAllActivities().slice(0, 5);
    
    const formattedActivities: ActivityItem[] = recentLogs.map(log => {
      let type: "success" | "warning" | "info" = "info";
      let icon = Info;
      
      switch (log.status) {
        case 'success':
          type = "success";
          icon = CheckCircle;
          break;
        case 'warning':
          type = "warning";
          icon = AlertTriangle;
          break;
        case 'error':
          type = "warning";
          icon = AlertTriangle;
          break;
        default:
          type = "info";
          icon = Info;
      }

      return {
        type,
        icon,
        message: log.details,
        time: formatTimeAgo(log.timestamp)
      };
    });

    setActivities(formattedActivities);
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await logSuccess(
        'Dashboard',
        'REFRESH_ACTIVITIES',
        'Manually refreshed recent activities'
      );
      loadRecentActivities();
    } catch (error) {
      console.error('Failed to log refresh:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for new activities
  useEffect(() => {
    const handleNewActivity = () => {
      loadRecentActivities();
    };

    activityLogger.addListener(handleNewActivity);
    return () => activityLogger.removeListener(handleNewActivity);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <activity.icon className={`h-4 w-4 mt-0.5 ${
                  activity.type === 'success' ? 'text-green-600' :
                  activity.type === 'warning' ? 'text-orange-600' :
                  'text-blue-600'
                }`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No recent activities</p>
              <p className="text-xs text-muted-foreground mt-1">
                Activities will appear here as you use the system
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}