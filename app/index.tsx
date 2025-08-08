// app/index.tsx - Main entry point that handles auth flow
import { useRootNavigationState, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { isJWTExpired, useTokenWatcher } from '~/lib/utils';
import { useAuthStore } from '~/store/authStore';

const Index = () => {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { token, isLoading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait a bit longer and check if navigation is ready
    const timer = setTimeout(() => {
      if (rootNavigationState?.key) {
        setIsReady(true);
      }
    }, 200); // Increased delay

    return () => clearTimeout(timer);
  }, [rootNavigationState]);

  useTokenWatcher(token);

  useEffect(() => {
    // Only navigate when everything is ready
    if (isReady && !isLoading && rootNavigationState?.key) {
      if (token && !isJWTExpired(token)) {
        router.replace('/screens/(tabs)/dashboard');
      } else {
        router.replace('/screens/(auth)/RegisterScreen');
      }
    }
  }, [isReady, isLoading, token, router, rootNavigationState]);

  // Show loading screen while checking auth state
  return (
    <View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
};

export default Index;
