/**
 * Formats a date string into a human-readable date and time string.
 *
 * @param dateString - The date string to format.
 * @returns The formatted date string (e.g., "Jan 1, 2023, 12:00 PM").
 */

/**
 * Formats a date string into a human-readable time string.
 *
 * @param dateString - The date string to format.
 * @returns The formatted time string (e.g., "12:00 PM").
 */

/**
 * Formats a date string into an object containing formatted date and time strings.
 *
 * @param dateString - The date string to format.
 * @returns An object with `date` and `time` properties containing formatted strings.
 */

/**
 * Checks if a JWT token is expired.
 *
 * If the token is expired, it resets the authentication state and returns `true`.
 * If the token is invalid or an error occurs, it logs the error and returns `true`.
 *
 * @param token - The JWT token string to check.
 * @returns `true` if the token is expired or invalid, otherwise `false`.
 */

import { useAuthStore } from '~/store/authStore';
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

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
    const expired = payload.exp < currentTime;
    if (expired) {
      useAuthStore.setState({
        token: null,
        user: null,
        role: null,
        resMessage: null,
        error: 'Session expired. Please log in again.',
      });
    }
    return expired;
  } catch (error) {
    //TODO: Remove console.error in production
    console.error('Error checking JWT expiration:', error);
    return true;
  }
};

export { formatDate, formatDateTime, formatTime, isJWTExpired };
