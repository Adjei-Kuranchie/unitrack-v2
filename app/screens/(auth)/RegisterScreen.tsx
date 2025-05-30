import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '~/store/authStore';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'STUDENT' as 'LECTURER' | 'STUDENT',
  });

  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    const { username, password, firstName, lastName, email } = formData;

    if (
      !username.trim() ||
      !password.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim()
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    await register(formData);

    // Check if registration was successful
    const { error: registrationError } = useAuthStore.getState();
    if (!registrationError) {
      Alert.alert('Success', 'Account created successfully! Please sign in.', [
        { text: 'OK', onPress: () => router.replace('/SignInscreen') },
      ]);
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        <View className="mb-8">
          <Text className="mb-2 text-center text-3xl font-bold text-blue-600">Create Account</Text>
          <Text className="text-center text-gray-600">Join UniTrack today</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="mb-2 font-medium text-gray-700">Username</Text>
            <TextInput
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              placeholder="Choose a username"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View>
            <Text className="mb-2 font-medium text-gray-700">Password</Text>
            <TextInput
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <View>
            <Text className="mb-2 font-medium text-gray-700">First Name</Text>
            <TextInput
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              editable={!isLoading}
            />
          </View>

          <View>
            <Text className="mb-2 font-medium text-gray-700">Last Name</Text>
            <TextInput
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              editable={!isLoading}
            />
          </View>

          <View>
            <Text className="mb-2 font-medium text-gray-700">Email</Text>
            <TextInput
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View>
            <Text className="mb-2 font-medium text-gray-700">Role</Text>
            <View className="rounded-lg border border-gray-300">
              <Picker
                selectedValue={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                enabled={!isLoading}>
                <Picker.Item label="Student" value="STUDENT" />
                <Picker.Item label="Lecturer" value="LECTURER" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            className={`mt-6 rounded-lg bg-blue-600 py-4 ${isLoading ? 'opacity-50' : ''}`}
            onPress={handleRegister}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-lg font-semibold text-white">Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="mt-4" onPress={() => router.back()} disabled={isLoading}>
            <Text className="text-center text-blue-600">Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
