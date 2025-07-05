// app/index.tsx - Main entry point that handles auth flow
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { isJWTExpired } from '~/lib/utils';
import { useAuthStore } from '~/store/authStore';

const Index = () => {
  const { token, isLoading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to ensure auth store is properly initialized
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady && !isLoading) {
      if (token && !isJWTExpired(token)) {
        router.replace('/screens/(tabs)/dashboard');
      } else {
        router.replace('/screens/(auth)/RegisterScreen');
      }
    }
  }, [isReady, isLoading, token, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text>Checking Auth state{` IsLoading:${isLoading} | isReady:${isReady}`}</Text>
    </View>
  );
};

export default Index;
