// hooks/useUIHelpers.ts
export const useUIHelpers = () => {
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'No Date';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Invalid date:', date);
      return 'Invalid Date';
    }
  };

  const normalizeRating = (rating: number): number => {
    return Math.max(0, Math.min(5, rating));
  };

  const calculateBarWidth = (value: number): string => {
    const normalizedValue = normalizeRating(value);
    return `${(normalizedValue / 5) * 100}%`;
  };

  return {
    formatDate,
    normalizeRating,
    calculateBarWidth
  };
};