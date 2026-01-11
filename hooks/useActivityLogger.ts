import { useCallback } from 'react';
import { logSuccess, logError, logWarning } from '@/lib/activity/activity-logger';

export const useActivityLogger = () => {
  const logPageAccess = useCallback(async (module: string, details: string) => {
    try {
      await logSuccess(module, 'PAGE_ACCESS', details);
    } catch (error) {
      console.error('Failed to log page access:', error);
    }
  }, []);

  const logBuyerAction = useCallback(async (
    action: string, 
    buyerName: string, 
    type: string, 
    metadata?: any
  ) => {
    try {
      await logSuccess(
        'Institutional Buyers',
        action,
        `${action.replace(/_/g, ' ')}: ${buyerName}`,
        undefined,
        { buyerName, type, ...metadata }
      );
    } catch (error) {
      console.error('Failed to log buyer action:', error);
    }
  }, []);

  const logProjectAction = useCallback(async (
    action: string, 
    projectName: string, 
    buyerName: string, 
    metadata?: any
  ) => {
    try {
      await logSuccess(
        'Project Buyers',
        action,
        `${action.replace(/_/g, ' ')}: ${projectName}`,
        undefined,
        { projectName, buyerName, ...metadata }
      );
    } catch (error) {
      console.error('Failed to log project action:', error);
    }
  }, []);

  const logErrorAction = useCallback(async (
    module: string,
    action: string,
    error: string,
    metadata?: any
  ) => {
    try {
      await logError(module, action, error, undefined, metadata);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }, []);

  const logWarningAction = useCallback(async (
    module: string,
    action: string,
    details: string,
    metadata?: any
  ) => {
    try {
      await logWarning(module, action, details, undefined, metadata);
    } catch (error) {
      console.error('Failed to log warning:', error);
    }
  }, []);

  return {
    logPageAccess,
    logBuyerAction,
    logProjectAction,
    logErrorAction,
    logWarningAction
  };
};