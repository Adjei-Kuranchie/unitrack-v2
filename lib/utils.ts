import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '~/store/authStore';

/**
 * Formats a date string for CSV export in a clean format.
 * Example output: "2024-01-15"
 *
 * @param dateString - The date string to format.
 * @returns The formatted date string for CSV.
 */
const formatDateForCSV = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Formats a time string for CSV export in a clean format.
 * Example output: "10:30 AM"
 *
 * @param dateString - The date string to format.
 * @returns The formatted time string for CSV.
 */
const formatTimeForCSV = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats a date string for filename usage (safe characters only).
 * Example output: "2024-01-15_10-30"
 *
 * @param dateString - The date string to format.
 * @returns The formatted date string safe for filenames.
 */
const formatDateForFilename = (dateString: string) => {
  const date = new Date(dateString);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = date.toTimeString().split(' ')[0].substring(0, 5).replace(':', '-'); // HH-MM
  return `${dateStr}_${timeStr}`;
};

/**
 * Escapes CSV field values to handle commas, quotes, and newlines.
 *
 * @param field - The field value to escape.
 * @returns The escaped field value.
 */
const escapeCSVField = (field: string | number | null | undefined): string => {
  if (field === null || field === undefined) return '';

  const stringField = String(field);

  // If the field contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
};
/**
 * Formats a date string into a human-readable date and time string.
 * Example output: "Jan 1, 2024, 10:30 AM"
 *
 * @param dateString - The date string to format.
 * @returns The formatted date and time string.
 */

const formatDate = (dateString: string, includeTime: boolean = true) => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date string into a human-readable time string.
 * Example output: "10:30 AM"
 *
 * @param dateString - The date string to format.
 * @returns The formatted time string.
 */

const formatTime = (dateString: string, exportFormat?: boolean) => {
  const timeString = new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  // If you want to format the time as "1-01-1025", you can use:
  const exportString = `${new Date(dateString).getHours()}-${String(new Date(dateString).getMinutes()).padStart(2, '0')}-${String(new Date(dateString).getFullYear()).padStart(4, '0')}`;
  return exportFormat ? exportString : timeString;
};

/**
 * Formats a date string into an object containing a formatted date and time.
 * Example output: { date: "Monday, January 1, 2024", time: "10:30 AM" }
 *
 * @param dateString - The date string to format.
 * @returns An object with formatted `date` and `time` strings.
 */

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

/**
 * Checks if a given JWT token is expired.
 *
 * @param token - The JWT token string to check.
 * @returns `true` if the token is expired or invalid, otherwise `false`.
 */

const isJWTExpired = (token: string | null): boolean => {
  try {
    if (!token) {
      throw new Error('Token is null or undefined');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    if (!payload.exp) {
      throw new Error('No expiration time found in token');
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    //TODO: Remove console.error in production
    console.error('Error checking JWT expiration:', error);
    return true;
  }
};

/**
 * Logs out the user by clearing authentication state and redirects to the Register screen.
 */
const logoutAndRedirect = () => {
  useAuthStore.setState({
    token: null,
    user: null,
    role: null,
    resMessage: null,
    error: 'Session expired. Please log in again.',
  });

  router.replace('/screens/(auth)/RegisterScreen');
};

/**
 * React hook that watches a JWT token and logs out the user if the token expires.
 * Checks token expiration on mount and every 10 seconds.
 *
 * @param token - The JWT token string to watch.
 */

const useTokenWatcher = (token: string | null) => {
  useEffect(() => {
    // Initial check on mount
    if (token && isJWTExpired(token)) {
      logoutAndRedirect();
    }

    // Periodically check token every 10 seconds
    const interval = setInterval(
      () => {
        if (token && isJWTExpired(token)) {
          logoutAndRedirect();
        }
      },
      1000 * 60 * 10
    ); // 10 minutes

    return () => clearInterval(interval); // Clean up
  }, [token]);
};

export {
  escapeCSVField,
  formatDate,
  formatDateForCSV,
  formatDateForFilename,
  formatDateTime,
  formatTime,
  formatTimeForCSV,
  isJWTExpired,
  useTokenWatcher,
};
