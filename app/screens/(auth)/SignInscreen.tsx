/**
 * SignInScreen component provides a user interface for signing in to the UniTrack application.
 *
 * Features:
 * - Allows users to input their username and password.
 * - Toggles password visibility.
 * - Handles sign-in logic with validation and error handling.
 * - Displays loading indicator during authentication.
 * - Navigates to the dashboard upon successful sign-in.
 * - Provides a link to the registration screen for new users.
 * - Includes a temporary function for testing API connectivity.
 *
 * State:
 * - `username`: The username input by the user.
 * - `password`: The password input by the user.
 * - `showPassword`: Boolean to toggle password visibility.
 *
 * Store:
 * - Uses `useAuthStore` for authentication logic, loading state, and error handling.
 *
 * Side Effects:
 * - Displays an alert if an authentication error occurs.
 *
 * @component
 * @returns {JSX.Element} The rendered sign-in screen.
 */
import { Feather } from '@expo/vector-icons';
import { showToast } from 'au-react-native-toast';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading, error, clearError } = useAuthStore();

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      showToast(
        'Please fill in all fields',
        3000,
        true,
        { backgroundColor: 'pink', padding: 5 },
        { color: 'red', fontSize: 15 }
      );
      return;
    }

    await signIn(username, password);

    // Check if sign in was successful
    const { user, resMessage } = useAuthStore.getState();
    if (resMessage) {
      router.replace('/screens/(tabs)/dashboard');
    }
  };

  // Add this function to your SignInScreen component for testing
  const testApiConnection = async () => {
    try {
      console.log('Testing connection to:', API_BASE_URL);

      // Test basic connectivity
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'Julie901',
          password: 'julie0990',
          firstName: 'Julie',
          lastName: 'Dona',
          email: 'tapose9852@jeanssi.com',
          role: 'STUDENT',
        }),
      });

      console.log('Connection test - Status:', response.status);
      console.log('Connection test - OK:', response.ok);

      // Also log the response text to see what the server is returning
      const responseText = await response.text();
      console.log('Response:', responseText);

      Alert.alert(
        'Connection Test',
        `Status: ${response.status}\nResponse: ${responseText}\nURL: ${API_BASE_URL}`
      );
    } catch (error) {
      console.error('Connection test failed:', error);
      Alert.alert(
        'Connection Failed',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}\nURL: ${API_BASE_URL}`
      );
    }
  };

  useEffect(() => {
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
            placeholder="Username"
            value={username}
            onChangeText={(text) => setUsername(text.trim())}
            autoCapitalize="none"
            editable={!isLoading}
            autoComplete="username"
          />
        </View>

        <View>
          <Text className="mb-2 font-medium text-gray-700">Password</Text>
          <View className="relative">
            <TextInput
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text.trim())}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              autoComplete="password"
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 h-12 w-12 items-center justify-center rounded-full ">
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="gray" />
            </Pressable>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
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
          activeOpacity={0.7}
          className="mt-4"
          onPress={() => router.push('/screens/(auth)/RegisterScreen')}
          disabled={isLoading}>
          <Text className="text-center text-blue-600">
            Don&apos;t have an account? Register here
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add a test button in your JSX (temporarily): */}
      {/*
       */}
    </View>
  );
}
