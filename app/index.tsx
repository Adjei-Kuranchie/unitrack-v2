// app/index.tsx - Simplified version with better error handling
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { isJWTExpired, useTokenWatcher } from '~/lib/utils';
import { useAuthStore } from '~/store/authStore';

const Index = () => {
  const router = useRouter();
  const { token, isLoading } = useAuthStore();
  const [navigationComplete, setNavigationComplete] = useState(false);

  // Initialize token watcher
  useTokenWatcher(token);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const handleNavigation = async () => {
        // Wait for auth store to be ready
        if (isLoading) {
          return;
        }

        // Ensure app is in active state
        if (AppState.currentState !== 'active') {
          return;
        }

        try {
          // Small delay to ensure layout is mounted
          await new Promise((resolve) => setTimeout(resolve, 150));

          if (!isMounted) return;

          const shouldNavigateToDashboard = token && !isJWTExpired(token);
          const targetRoute = shouldNavigateToDashboard
            ? '/screens/(tabs)/dashboard'
            : '/screens/(auth)/RegisterScreen';

          console.log('Navigating to:', targetRoute);

          // Use replace for clean navigation
          router.replace(targetRoute);
          setNavigationComplete(true);
        } catch (error) {
          console.error('Navigation error in index:', error);

          if (isMounted) {
            // Fallback to auth screen with retry logic
            setTimeout(() => {
              if (isMounted) {
                try {
                  router.replace('/screens/(auth)/RegisterScreen');
                  setNavigationComplete(true);
                } catch (retryError) {
                  console.error('Retry navigation failed:', retryError);
                }
              }
            }, 500);
          }
        }
      };

      // Only attempt navigation if not already completed
      if (!navigationComplete) {
        handleNavigation();
      }

      return () => {
        isMounted = false;
      };
    }, [token, isLoading, router, navigationComplete])
  );

  // Show loading while determining auth state or navigating
  if (isLoading || !navigationComplete) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // This should rarely be reached
  return null;
};

export default Index;
