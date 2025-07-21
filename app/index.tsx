// app/index.tsx - Main entry point that handles auth flow
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { isJWTExpired, useTokenWatcher } from '~/lib/utils';
import { useAuthStore } from '~/store/authStore';

const Index = () => {
  const router = useRouter();
  const { token, isLoading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure auth store is properly initialized
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useTokenWatcher(token);

  useEffect(() => {
    // Handle navigation after component is ready and auth state is determined
    if (isReady && !isLoading) {
      if (token && !isJWTExpired(token)) {
        router.replace('/screens/(tabs)/dashboard');
      } else {
        router.replace('/screens/(auth)/RegisterScreen');
      }
    }
  }, [isReady, isLoading, token, router]);

  // Show loading screen while checking auth state
  if (!isReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Return null while navigation is happening
  return null;
};

export default Index;
