export async function logActivity(activityData: {
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  status?: "success" | "error" | "warning";
}) {
  try {
    const response = await fetch('/api/activity-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      throw new Error('Failed to log activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error logging activity:', error);
    // Fallback to localStorage
    const activities = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    const newActivity = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...activityData
    };
    activities.push(newActivity);
    localStorage.setItem('activityLogs', JSON.stringify(activities));
    return newActivity;
  }
}

// Example usage:
// await logActivity({
//   user: 'john.doe',
//   action: 'login',
//   module: 'Authentication',
//   details: 'User logged in successfully',
//   ipAddress: '192.168.1.1',
//   status: 'success'
// });