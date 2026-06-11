/**
 * General helper utilities for QueueEase
 */

/**
 * Generate a random queue token number (e.g., "A-042")
 */
export const generateTokenNumber = (prefix: string = 'A'): string => {
  const num = Math.floor(Math.random() * 999) + 1;
  return `${prefix}-${num.toString().padStart(3, '0')}`;
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalize all words in a string
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Format a phone number for Sri Lanka (+94)
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+94 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.startsWith('94') && cleaned.length === 11) {
    return `+94 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Validate Sri Lankan phone number
 */
export const isValidSriLankanPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return (
    (cleaned.startsWith('0') && cleaned.length === 10) ||
    (cleaned.startsWith('94') && cleaned.length === 11) ||
    (cleaned.startsWith('+94') && cleaned.length === 12)
  );
};

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Sleep for a given number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Get initials from a name (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format a number with commas (e.g., 1234 -> "1,234")
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Validate image URLs before assigning to DOM attributes
 */
export const isValidImageUrl = (value: unknown): boolean => {
  if (typeof value !== 'string' || !value.trim()) return false;

  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Clamp a number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Calculate estimated wait time based on queue position and average consultation time
 */
export const estimateWaitTime = (
  position: number,
  avgConsultationMinutes: number = 15,
  doctorsAvailable: number = 1
): number => {
  if (position <= 0) return 0;
  return Math.ceil((position * avgConsultationMinutes) / doctorsAvailable);
};

/**
 * Get priority weight for sorting
 */
export const getPriorityWeight = (priority: string): number => {
  switch (priority) {
    case 'emergency': return 0;
    case 'urgent': return 1;
    case 'normal': return 2;
    default: return 3;
  }
};

/**
 * Get status color class for queue entries
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    waiting: 'text-yellow-400',
    'in-consultation': 'text-teal-400',
    completed: 'text-green-400',
    cancelled: 'text-gray-400',
    emergency: 'text-red-400',
  };
  return colors[status] || 'text-gray-400';
};

/**
 * Get priority badge color class
 */
export const getPriorityBadgeColor = (priority: string): string => {
  const colors: Record<string, string> = {
    emergency: 'bg-red-500/20 text-red-400 border-red-500/30',
    urgent: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    normal: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  };
  return colors[priority] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

/**
 * Convert bytes to human readable format
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Safely parse JSON
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

/**
 * Check if running on mobile device
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
