'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BarChart3, ArrowRight } from 'lucide-react';
import { logSuccess, logError } from '@/lib/activity/activity-logger';

interface ViewMonitoringButtonProps {
  projectId: string;
  projectName: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  showText?: boolean;
}

export function ViewMonitoringButton({
  projectId,
  projectName,
  variant = 'outline',
  size = 'default',
  showIcon = true,
  showText = true
}: ViewMonitoringButtonProps) {
  const router = useRouter();

  const handleViewMonitoring = async () => {
    try {
      await logSuccess(
        'Projects Management',
        'NAVIGATE_TO_MONITORING',
        `Navigated to monitoring for project: ${projectName}`,
        undefined,
        { 
          projectId,
          projectName
        }
      );
      
      // Navigate to monitoring page with project filter
      router.push(`/admin/program-monitoring?project=${projectId}`);
    } catch (error) {
      console.error('Failed to log monitoring navigation:', error);
      // Still navigate even if logging fails
      router.push(`/admin/program-monitoring?project=${projectId}`);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleViewMonitoring}
      className="flex items-center gap-2"
    >
      {showIcon && <BarChart3 className="h-4 w-4" />}
      {showText && (
        <>
          View Monitoring
          <ArrowRight className="h-3 w-3" />
        </>
      )}
    </Button>
  );
}