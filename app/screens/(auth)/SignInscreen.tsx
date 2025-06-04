import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '~/store/authStore';

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      router.replace('/screens/(tabs)');
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

      <View className="flex flex-col gap-4 space-y-4">
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
          <View className="relative">
            <TextInput
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 h-12 w-12 items-center justify-center rounded-full ">
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="gray" />
            </Pressable>
          </View>
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
          onPress={() => router.push('/screens/(auth)/RegisterScreen')}
          disabled={isLoading}>
          <Text className="text-center text-blue-600">
            Don&apos;t have an account? Register here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
