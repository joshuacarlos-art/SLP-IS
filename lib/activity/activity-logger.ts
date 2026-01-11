// lib/activityLogger.ts
'use client';

export interface ActivityLogData {
  id?: string;
  timestamp: Date;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'error' | 'warning';
  metadata?: Record<string, any>;
}

export interface ActivityLoggerConfig {
  maxEntries?: number;
  enableLocalStorage?: boolean;
  enableConsoleLog?: boolean;
  autoCleanup?: boolean;
}

export class ActivityLogger {
  private static instance: ActivityLogger;
  private config: ActivityLoggerConfig;
  private listeners: Array<(activity: ActivityLogData) => void> = [];

  private defaultConfig: ActivityLoggerConfig = {
    maxEntries: 1000,
    enableLocalStorage: true,
    enableConsoleLog: process.env.NODE_ENV === 'development',
    autoCleanup: true,
  };

  private constructor(config: Partial<ActivityLoggerConfig> = {}) {
    this.config = { ...this.defaultConfig, ...config };
    this.initialize();
  }

  public static getInstance(config?: Partial<ActivityLoggerConfig>): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger(config);
    }
    return ActivityLogger.instance;
  }

  private initialize(): void {
    if (this.config.autoCleanup) {
      this.cleanupOldEntries();
    }
  }

  // Main logging method
  async logActivity(activityData: Omit<ActivityLogData, 'id' | 'timestamp' | 'ipAddress'>): Promise<string> {
    try {
      const activity: ActivityLogData = {
        ...activityData,
        id: this.generateId(),
        timestamp: new Date(),
        ipAddress: await this.getClientIP(),
      };

      // Save to MongoDB via API
      try {
        const response = await fetch('/api/activity-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(activity),
        });

        if (!response.ok) {
          throw new Error('Failed to save to MongoDB');
        }
      } catch (mongoError) {
        console.warn('MongoDB save failed, using localStorage fallback');
        // Fallback to localStorage
        if (this.config.enableLocalStorage) {
          this.saveToLocalStorage(activity);
        }
      }

      // Log to console if enabled
      if (this.config.enableConsoleLog) {
        this.logToConsole(activity);
      }

      // Notify listeners
      this.notifyListeners(activity);

      return activity.id!;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  // Quick log methods for common actions
  async logSuccess(module: string, action: string, details: string, user?: string, metadata?: Record<string, any>) {
    return this.logActivity({
      user: user || this.getCurrentUser(),
      action,
      module,
      details,
      status: 'success',
      metadata,
    });
  }

  async logError(module: string, action: string, details: string, user?: string, metadata?: Record<string, any>) {
    return this.logActivity({
      user: user || this.getCurrentUser(),
      action,
      module,
      details,
      status: 'error',
      metadata,
    });
  }

  async logWarning(module: string, action: string, details: string, user?: string, metadata?: Record<string, any>) {
    return this.logActivity({
      user: user || this.getCurrentUser(),
      action,
      module,
      details,
      status: 'warning',
      metadata,
    });
  }

  // Association-specific logging methods
  async logAssociationCreation(associationName: string, user?: string, metadata?: Record<string, any>) {
    return this.logSuccess(
      'Associations',
      'CREATE_ASSOCIATION',
      `Created new association: ${associationName}`,
      user,
      { associationName, ...metadata }
    );
  }

  async logAssociationUpdate(associationName: string, user?: string, metadata?: Record<string, any>) {
    return this.logSuccess(
      'Associations',
      'UPDATE_ASSOCIATION',
      `Updated association: ${associationName}`,
      user,
      { associationName, ...metadata }
    );
  }

  async logAssociationArchive(associationName: string, user?: string, metadata?: Record<string, any>) {
    return this.logWarning(
      'Associations',
      'ARCHIVE_ASSOCIATION',
      `Archived association: ${associationName}`,
      user,
      { associationName, ...metadata }
    );
  }

  async logAssociationRestore(associationName: string, user?: string, metadata?: Record<string, any>) {
    return this.logSuccess(
      'Associations',
      'RESTORE_ASSOCIATION',
      `Restored association: ${associationName}`,
      user,
      { associationName, ...metadata }
    );
  }

  async logAssociationError(action: string, error: string, associationName?: string, user?: string) {
    return this.logError(
      'Associations',
      action,
      associationName ? `Failed to ${action.toLowerCase()} association ${associationName}: ${error}` : `Failed to ${action.toLowerCase()}: ${error}`,
      user,
      { associationName, error }
    );
  }

  // Caretaker-specific logging methods
  async logCaretakerCreation(caretakerName: string, associationName: string, user?: string, metadata?: Record<string, any>) {
    return this.logSuccess(
      'Caretakers',
      'CREATE_CARETAKER',
      `Added caretaker ${caretakerName} to ${associationName}`,
      user,
      { caretakerName, associationName, ...metadata }
    );
  }

  async logCaretakerDeletion(caretakerName: string, associationName: string, user?: string, metadata?: Record<string, any>) {
    return this.logWarning(
      'Caretakers',
      'DELETE_CARETAKER',
      `Removed caretaker ${caretakerName} from ${associationName}`,
      user,
      { caretakerName, associationName, ...metadata }
    );
  }

  async logCaretakerError(action: string, error: string, caretakerName?: string, user?: string) {
    return this.logError(
      'Caretakers',
      action,
      caretakerName ? `Failed to ${action.toLowerCase()} caretaker ${caretakerName}: ${error}` : `Failed to ${action.toLowerCase()}: ${error}`,
      user,
      { caretakerName, error }
    );
  }

  // Performance Assessment specific methods - ADDED
  async logAssessmentCreate(
    caretakerName: string, 
    association: string, 
    rating: number, 
    metadata?: Record<string, any>
  ) {
    return this.logSuccess(
      'Performance Monitoring',
      'CREATE_ASSESSMENT',
      `Created performance assessment for ${caretakerName} with rating ${rating}/5`,
      undefined,
      { caretakerName, association, rating, ...metadata }
    );
  }

  async logAssessmentUpdate(
    caretakerName: string, 
    association: string, 
    rating: number, 
    metadata?: Record<string, any>
  ) {
    return this.logSuccess(
      'Performance Monitoring',
      'UPDATE_ASSESSMENT',
      `Updated performance assessment for ${caretakerName} with rating ${rating}/5`,
      undefined,
      { caretakerName, association, rating, ...metadata }
    );
  }

  async logAssessmentDelete(
    caretakerName: string, 
    association: string, 
    metadata?: Record<string, any>
  ) {
    return this.logWarning(
      'Performance Monitoring',
      'DELETE_ASSESSMENT',
      `Deleted performance assessment for ${caretakerName}`,
      undefined,
      { caretakerName, association, ...metadata }
    );
  }

  async logAssessmentError(
    action: string, 
    error: string, 
    caretakerName?: string, 
    user?: string
  ) {
    return this.logError(
      'Performance Monitoring',
      action,
      caretakerName ? `Failed to ${action.toLowerCase()} assessment for ${caretakerName}: ${error}` : `Failed to ${action.toLowerCase()} assessment: ${error}`,
      user,
      { caretakerName, error }
    );
  }

  // User authentication logging methods
  async logUserLogin(username: string, user?: string, metadata?: Record<string, any>) {
    return this.logSuccess(
      'Authentication',
      'USER_LOGIN',
      `User logged in: ${username}`,
      user || username,
      { username, ...metadata }
    );
  }

  async logUserLogout(username: string, user?: string, metadata?: Record<string, any>) {
    return this.logSuccess(
      'Authentication',
      'USER_LOGOUT',
      `User logged out: ${username}`,
      user || username,
      { username, ...metadata }
    );
  }

  async logLoginError(username: string, error: string, user?: string) {
    return this.logError(
      'Authentication',
      'USER_LOGIN',
      `Failed login attempt for user: ${username} - ${error}`,
      user,
      { username, error }
    );
  }

  // Data export logging methods
  async logExport(module: string, format: string, user?: string, metadata?: Record<string, any>) {
    return this.logSuccess(
      'Export',
      `EXPORT_${format.toUpperCase()}`,
      `Exported ${module} data as ${format}`,
      user,
      { module, format, ...metadata }
    );
  }

  // Dashboard specific methods
  async logDashboardAccess(user?: string) {
    return this.logSuccess(
      'Dashboard',
      'ACCESS_DASHBOARD',
      'User accessed the main dashboard overview',
      user
    );
  }

  async logStatsView(user?: string) {
    return this.logSuccess(
      'Dashboard',
      'VIEW_STATS',
      'User viewed dashboard statistics',
      user
    );
  }

  async logReportExport(format: string, user?: string) {
    return this.logSuccess(
      'Dashboard',
      'EXPORT_REPORT',
      `User exported dashboard report as ${format}`,
      user
    );
  }

  // Financial Records specific methods
  async logFinancialRecordCreate(projectName: string, recordType: string, amount: number, user?: string, metadata?: Record<string, any>) {
    return this.logSuccess(
      'Financial Records',
      'CREATE_RECORD',
      `Created ${recordType} record for ${projectName}: ₱${amount.toLocaleString()}`,
      user,
      { projectName, recordType, amount, ...metadata }
    );
  }

  async logFinancialRecordUpdate(projectName: string, recordType: string, amount: number, user?: string, metadata?: Record<string, any>) {
    return this.logSuccess(
      'Financial Records',
      'UPDATE_RECORD',
      `Updated ${recordType} record for ${projectName}: ₱${amount.toLocaleString()}`,
      user,
      { projectName, recordType, amount, ...metadata }
    );
  }

  async logFinancialRecordDelete(projectName: string, recordType: string, amount: number, user?: string, metadata?: Record<string, any>) {
    return this.logWarning(
      'Financial Records',
      'DELETE_RECORD',
      `Deleted ${recordType} record for ${projectName}: ₱${amount.toLocaleString()}`,
      user,
      { projectName, recordType, amount, ...metadata }
    );
  }

  async logFinancialRecordArchive(projectName: string, recordType: string, amount: number, user?: string, metadata?: Record<string, any>) {
    return this.logWarning(
      'Financial Records',
      'ARCHIVE_RECORD',
      `Archived ${recordType} record for ${projectName}: ₱${amount.toLocaleString()}`,
      user,
      { projectName, recordType, amount, ...metadata }
    );
  }

  async logFinancialRecordError(action: string, error: string, projectName?: string, user?: string) {
    return this.logError(
      'Financial Records',
      action,
      projectName ? `Failed to ${action.toLowerCase()} financial record for ${projectName}: ${error}` : `Failed to ${action.toLowerCase()} financial record: ${error}`,
      user,
      { projectName, error }
    );
  }

  // Utility methods
  getAllActivities(): ActivityLogData[] {
    if (typeof window === 'undefined' || !this.config.enableLocalStorage) {
      return [];
    }

    try {
      const stored = localStorage.getItem('activityLogs');
      if (!stored) return [];

      const activities = JSON.parse(stored);
      return activities.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      }));
    } catch (error) {
      console.error('Error reading activities from localStorage:', error);
      return [];
    }
  }

  getActivitiesByModule(module: string): ActivityLogData[] {
    return this.getAllActivities().filter(activity => activity.module === module);
  }

  getActivitiesByUser(user: string): ActivityLogData[] {
    return this.getAllActivities().filter(activity => activity.user === user);
  }

  getActivitiesByStatus(status: ActivityLogData['status']): ActivityLogData[] {
    return this.getAllActivities().filter(activity => activity.status === status);
  }

  searchActivities(query: string): ActivityLogData[] {
    const activities = this.getAllActivities();
    const lowerQuery = query.toLowerCase();
    
    return activities.filter(activity =>
      activity.user.toLowerCase().includes(lowerQuery) ||
      activity.action.toLowerCase().includes(lowerQuery) ||
      activity.module.toLowerCase().includes(lowerQuery) ||
      activity.details.toLowerCase().includes(lowerQuery) ||
      activity.ipAddress.toLowerCase().includes(lowerQuery)
    );
  }

  clearActivities(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('activityLogs');
      this.notifyListeners(); // Notify with empty data
    }
  }

  // Event listeners for real-time updates
  addListener(callback: (activity: ActivityLogData) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (activity: ActivityLogData) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(activity?: ActivityLogData): void {
    this.listeners.forEach(listener => {
      try {
        listener(activity!);
      } catch (error) {
        console.error('Error in activity listener:', error);
      }
    });
  }

  // Private helper methods
  private saveToLocalStorage(activity: ActivityLogData): void {
    if (typeof window === 'undefined') return;

    try {
      const existingActivities = this.getAllActivities();
      const updatedActivities = [activity, ...existingActivities];

      // Apply max entries limit
      const trimmedActivities = updatedActivities.slice(0, this.config.maxEntries);

      localStorage.setItem('activityLogs', JSON.stringify(trimmedActivities));
    } catch (error) {
      console.error('Error saving activity to localStorage:', error);
    }
  }

  private logToConsole(activity: ActivityLogData): void {
    const styles = {
      success: 'color: green; font-weight: bold;',
      error: 'color: red; font-weight: bold;',
      warning: 'color: orange; font-weight: bold;',
    };

    console.groupCollapsed(
      `%c${activity.module}%c - %c${activity.action}`,
      'color: blue; font-weight: bold;',
      'color: gray;',
      styles[activity.status]
    );
    console.log('User:', activity.user);
    console.log('Details:', activity.details);
    console.log('Timestamp:', activity.timestamp.toLocaleString());
    console.log('IP:', activity.ipAddress);
    if (activity.metadata) {
      console.log('Metadata:', activity.metadata);
    }
    console.groupEnd();
  }

  private generateId(): string {
    return `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getClientIP(): Promise<string> {
    try {
      // In a real application, you might want to get this from your backend
      // or use a service like ipapi.co
      return '192.168.1.100'; // Placeholder for development
    } catch {
      return 'unknown';
    }
  }

  private getCurrentUser(): string {
    if (typeof window === 'undefined') return 'System';

    try {
      // Get user from your authentication system
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        return user.name || user.username || user.email || 'Authenticated User';
      }
      
      return 'System';
    } catch {
      return 'System';
    }
  }

  private cleanupOldEntries(): void {
    if (typeof window === 'undefined') return;

    try {
      const activities = this.getAllActivities();
      if (activities.length > (this.config.maxEntries || 1000)) {
        const trimmedActivities = activities.slice(0, this.config.maxEntries);
        localStorage.setItem('activityLogs', JSON.stringify(trimmedActivities));
      }
    } catch (error) {
      console.error('Error cleaning up old entries:', error);
    }
  }

  // Configuration methods
  updateConfig(newConfig: Partial<ActivityLoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): ActivityLoggerConfig {
    return { ...this.config };
  }
}

// Convenience export functions
export const activityLogger = ActivityLogger.getInstance();

// Quick export functions for common use cases
export const logActivity = activityLogger.logActivity.bind(activityLogger);
export const logSuccess = activityLogger.logSuccess.bind(activityLogger);
export const logError = activityLogger.logError.bind(activityLogger);
export const logWarning = activityLogger.logWarning.bind(activityLogger);

// Association-specific quick functions
export const logAssociationCreate = activityLogger.logAssociationCreation.bind(activityLogger);
export const logAssociationUpdate = activityLogger.logAssociationUpdate.bind(activityLogger);
export const logAssociationArchive = activityLogger.logAssociationArchive.bind(activityLogger);
export const logAssociationRestore = activityLogger.logAssociationRestore.bind(activityLogger);

// Caretaker-specific quick functions
export const logCaretakerCreate = activityLogger.logCaretakerCreation.bind(activityLogger);
export const logCaretakerDelete = activityLogger.logCaretakerDeletion.bind(activityLogger);

// Performance Assessment quick functions - ADDED
export const logAssessmentCreate = activityLogger.logAssessmentCreate.bind(activityLogger);
export const logAssessmentUpdate = activityLogger.logAssessmentUpdate.bind(activityLogger);
export const logAssessmentDelete = activityLogger.logAssessmentDelete.bind(activityLogger);

// Authentication quick functions
export const logUserLogin = activityLogger.logUserLogin.bind(activityLogger);
export const logUserLogout = activityLogger.logUserLogout.bind(activityLogger);

// Dashboard quick functions
export const logDashboardAccess = activityLogger.logDashboardAccess.bind(activityLogger);
export const logStatsView = activityLogger.logStatsView.bind(activityLogger);
export const logReportExport = activityLogger.logReportExport.bind(activityLogger);

// Financial Records quick functions
export const logFinancialCreate = activityLogger.logFinancialRecordCreate.bind(activityLogger);
export const logFinancialUpdate = activityLogger.logFinancialRecordUpdate.bind(activityLogger);
export const logFinancialDelete = activityLogger.logFinancialRecordDelete.bind(activityLogger);
export const logFinancialArchive = activityLogger.logFinancialRecordArchive.bind(activityLogger);