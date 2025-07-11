import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '~/store/authStore';

/**
 * Formats a date string into a human-readable date and time string.
 * Example output: "Jan 1, 2024, 10:30 AM"
 *
 * @param dateString - The date string to format.
 * @returns The formatted date and time string.
 */

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

/**
 * Formats a date string into a human-readable time string.
 * Example output: "10:30 AM"
 *
 * @param dateString - The date string to format.
 * @returns The formatted time string.
 */

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

export { formatDate, formatDateTime, formatTime, isJWTExpired, useTokenWatcher };
