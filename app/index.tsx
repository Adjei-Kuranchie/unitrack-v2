// app/index.tsx - Main entry point that handles auth flow
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '~/store/authStore';

const Index = () => {
  const { token, isLoading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure auth store is properly initialized
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while checking auth state
  if (!isReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Redirect based on authentication state
  if (token) {
    return <Redirect href="/screens/(tabs)/dashboard" />;
  } else {
    return <Redirect href="/screens/(auth)/RegisterScreen" />;
  }
};

export default Index;
