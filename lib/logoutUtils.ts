// lib/logoutUtils.ts - Create this as a separate file
import { router } from 'expo-router';
import { AppState, InteractionManager } from 'react-native';
import { useAuthStore } from '~/store/authStore';

let isLoggingOut = false;
let logoutTimeout: NodeJS.Timeout | null = null;

/**
 * Safe logout function that handles view hierarchy issues
 */
export const safeLogout = async (reason: string = 'User logout') => {
  // Prevent multiple simultaneous logout attempts
  if (isLoggingOut) {
    console.log('Logout already in progress, skipping...');
    return;
  }

  isLoggingOut = true;
  console.log('Starting logout process:', reason);

  try {
    // Clear any existing timeout
    if (logoutTimeout) {
      clearTimeout(logoutTimeout);
      logoutTimeout = null;
    }

    // Step 1: Clear auth state immediately
    useAuthStore.setState({
      token: null,
      user: null,
      role: null,
      resMessage: null,
      error: reason.includes('expired') ? 'Session expired. Please log in again.' : null,
    });

    // Step 2: Wait for app to be in foreground and interactions to complete
    await new Promise<void>((resolve) => {
      const checkAppState = () => {
        if (AppState.currentState === 'active') {
          InteractionManager.runAfterInteractions(() => {
            resolve();
          });
        } else {
          // If app is in background, wait for it to become active
          const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active') {
              AppState.removeEventListener('change', handleAppStateChange);
              InteractionManager.runAfterInteractions(() => {
                resolve();
              });
            }
          };
          AppState.addEventListener('change', handleAppStateChange);
        }
      };

      checkAppState();
    });

    // Step 3: Additional safety delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Step 4: Navigate with error handling
    try {
      console.log('Navigating to RegisterScreen...');

      // Use replace to avoid back navigation issues
      router.replace('/screens/(auth)/RegisterScreen');

      console.log('Navigation successful');
    } catch (navigationError) {
      console.error('Navigation error during logout:', navigationError);

      // Fallback: Try again after a longer delay
      setTimeout(() => {
        try {
          router.push('/screens/(auth)/RegisterScreen');
        } catch (fallbackError) {
          console.error('Fallback navigation also failed:', fallbackError);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('Error during logout process:', error);
  } finally {
    // Reset the logout flag after a delay
    logoutTimeout = setTimeout(() => {
      isLoggingOut = false;
      console.log('Logout process completed');
    }, 2000);
  }
};

/**
 * Hook for manual logout (user-initiated)
 */
export const useManualLogout = () => {
  const logout = async () => {
    await safeLogout('Manual logout');
  };

  return { logout, isLoggingOut };
};

/**
 * Automatic logout for expired tokens
 */
export const autoLogout = async () => {
  await safeLogout('Token expired');
};
