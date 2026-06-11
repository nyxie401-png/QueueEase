/**
 * Date utility functions for QueueEase
 */

/**
 * Format a date to a readable string
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a date to a short string (e.g., "Jan 15, 2024")
 */
export const formatShortDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a time to a readable string (e.g., "2:30 PM")
 */
export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format a date and time together
 */
export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Get relative time string (e.g., "5 minutes ago", "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d);
};

/**
 * Check if a date is today
 */
export const isToday = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is tomorrow
 */
export const isTomorrow = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
};

/**
 * Get the start of today (midnight)
 */
export const getStartOfDay = (date?: Date): Date => {
  const d = date || new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the end of today (23:59:59.999)
 */
export const getEndOfDay = (date?: Date): Date => {
  const d = date || new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add minutes to a date
 */
export const addMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

/**
 * Get the difference in minutes between two dates
 */
export const getMinutesDiff = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return Math.floor((d2.getTime() - d1.getTime()) / 60000);
};

/**
 * Format duration in minutes to human readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Get day name from date
 */
export const getDayName = (date: string | Date, short: boolean = false): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { weekday: short ? 'short' : 'long' });
};

/**
 * Get month name from date
 */
export const getMonthName = (date: string | Date, short: boolean = false): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: short ? 'short' : 'long' });
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

/**
 * Parse time string (e.g., "14:30") to Date object for today
 */
export const parseTime = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Format Date object to time string (e.g., "14:30")
 */
export const formatTime24 = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};