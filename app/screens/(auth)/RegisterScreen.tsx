/**
 * RegisterScreen component provides a user registration form for the UniTrack app.
 *
 * Features:
 * - Collects user information: username, password, first name, last name, email, and role (Student or Lecturer).
 * - Validates required fields and email format.
 * - Displays toast notifications for validation errors and registration success.
 * - Handles registration logic using the `useAuthStore` store.
 * - Shows loading indicator during registration.
 * - Allows toggling password visibility.
 * - Navigates to the Sign In screen upon successful registration.
 * - Responsive UI with keyboard awareness and safe area support.
 *
 * @component
 * @returns {JSX.Element} The rendered registration screen.
 */

import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { showToast } from 'au-react-native-toast';

import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '~/store/authStore';
import { RegisterData } from '~/types/auth';

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'LECTURER',
  });

  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    const { username, password, firstName, lastName, email } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !username.trim() ||
      !password.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim()
    ) {
      showToast(
        'Please fill in all fields',
        3000,
        true,
        { backgroundColor: 'pink', padding: 5 },
        { color: 'red', fontSize: 15 }
      );
      return;
    }

    if (!emailRegex.test(email)) {
      showToast(
        'Please enter a valid email address',
        3000,
        true,
        { backgroundColor: 'pink', padding: 5 },
        { color: 'red', fontSize: 15 }
      );
      return;
    }

    await register(formData);

    // Check if registration was successful
    const { error: registrationError } = useAuthStore.getState();
    if (!registrationError) {
      showToast(
        'Account Created! Please Sign In',
        3000,
        true,
        { backgroundColor: '#C0FFCB', padding: 5 },
        { color: 'green', fontSize: 15 }
      );
      return router.replace('/screens/(auth)/SignInScreen');
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  return (
    <KeyboardAwareScrollView className="flex-1" bottomOffset={30}>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="h-[100vh] flex-1 pt-12">
          <View className="px-6 py-8">
            <View className="mb-8">
              <Text className="mb-2 text-center text-3xl font-bold text-blue-600">
                Create Account
              </Text>
              <Text className="text-center text-gray-600">Join UniTrack today</Text>
            </View>

            <View className="flex flex-col gap-4 space-y-8">
              <View>
                <Text className="mb-2 font-medium text-gray-700">Username</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChangeText={(text) => setFormData({ ...formData, username: text.trim() })}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
              <View>
                <Text className="mb-2 font-medium text-gray-700">Password</Text>
                <View className="relative">
                  <TextInput
                    className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                    placeholder="Create a password"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text.trim() })}
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
              <View>
                <Text className="mb-2 font-medium text-gray-700">First Name</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text.trim() })}
                  editable={!isLoading}
                />
              </View>
              <View>
                <Text className="mb-2 font-medium text-gray-700">Last Name</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text.trim() })}
                  editable={!isLoading}
                />
              </View>
              <View>
                <Text className="mb-2 font-medium text-gray-700">Email</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text.trim() })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
              <View>
                <Text className="mb-2 font-medium text-gray-700">Role</Text>
                <View className="rounded-lg border border-gray-300">
                  {Platform.OS === 'android' || Platform.OS === 'ios' ? (
                    <Picker
                      selectedValue={formData.role}
                      onValueChange={(itemValue) => setFormData({ ...formData, role: itemValue })}
                      enabled={!isLoading}>
                      <Picker.Item label="Student" value="STUDENT" />
                      <Picker.Item label="Lecturer" value="LECTURER" />
                    </Picker>
                  ) : null}
                </View>
              </View>

              {/* TODO:ask to make the registerData take in program and indexNumber */}
              {/*
            {formData.role === 'LECTURER' && (
              <View>
                <Text className="mb-2 font-medium text-gray-700">Program</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                  placeholder="eg: Computer Science"
                  value={formData.program}
                  onChangeText={(text) => setFormData({ ...formData, program: text.trim() })}
                  editable={!isLoading}
                />
              </View>
            )}

            {formData.role === 'STUDENT' && (
              <View>
                <Text className="mb-2 font-medium text-gray-700">Index Number</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                  placeholder="eg: PS/CSC/21/0001"
                  value={formData.IndexNumber}
                  onChangeText={(text) => setFormData({ ...formData, IndexNumber: text.trim() })}
                  editable={!isLoading}
                />
              </View>
            )}
              */}
              <TouchableOpacity
                activeOpacity={0.7}
                className={`mt-6 rounded-lg bg-blue-600 py-4 ${isLoading ? 'opacity-50' : ''}`}
                onPress={handleRegister}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center text-lg font-semibold text-white">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                className="mt-4"
                onPress={() => router.replace('/screens/(auth)/SignInScreen')}
                disabled={isLoading}>
                <Text className="text-center text-blue-600">Already have an account? Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
