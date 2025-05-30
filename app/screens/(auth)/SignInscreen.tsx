import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '~/store/authStore';
import { router } from 'expo-router';

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading, error, clearError } = useAuthStore();

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    await signIn(username, password);

    // Check if sign in was successful
    const { user } = useAuthStore.getState();
    if (user) {
      router.replace('/(tabs)');
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <View className="mb-8">
        <Text className="mb-2 text-center text-3xl font-bold text-blue-600">UniTrack</Text>
        <Text className="text-center text-gray-600">Sign in to your account</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="mb-2 font-medium text-gray-700">Username</Text>
          <TextInput
            className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View>
          <Text className="mb-2 font-medium text-gray-700">Password</Text>
          <TextInput
            className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          className={`mt-6 rounded-lg bg-blue-600 py-4 ${isLoading ? 'opacity-50' : ''}`}
          onPress={handleSignIn}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-lg font-semibold text-white">Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4"
          onPress={() => router.push('/register')}
          disabled={isLoading}>
          <Text className="text-center text-blue-600">Don't have an account? Register here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
