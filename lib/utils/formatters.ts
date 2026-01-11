export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'Not set';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return 'Not set';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid date';
  }
};

export const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return 'N/A';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string | Date | undefined): string => {
  if (!dateString) return 'Not set';
  
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(date);
    }
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format association names
 */
export const formatAssociationName = (associationId: string | undefined): string => {
  if (!associationId) return 'No Association';
  
  try {
    // Remove common prefixes/suffixes
    let name = associationId
      .replace(/^ASSOC_/i, '')
      .replace(/^SLP_/i, '')
      .replace(/_/g, ' ')
      .replace(/[0-9]/g, '')
      .trim();
    
    if (!name) return 'Unnamed Association';
    
    // Capitalize first letter of each word
    name = name.split(' ')
      .map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
    
    // Add "Association" if not present
    if (!name.toLowerCase().includes('association') && 
        !name.toLowerCase().includes('alliance') && 
        !name.toLowerCase().includes('group')) {
      name += ' Association';
    }
    
    return name;
  } catch {
    return 'Invalid Association Name';
  }
};