
/**
 * Format date for display
 */
export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString('en-US', options);
};

/**
 * Format date with year
 */
export const formatFullDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Date(dateString).toLocaleDateString('en-US', options);
};
