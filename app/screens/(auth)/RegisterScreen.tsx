import { Feather, MaterialIcons } from '@expo/vector-icons';
import { showToast } from 'au-react-native-toast';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
    role: 'STUDENT',
    department: 'Science',
  });

  const { register, isLoading, error, clearError } = useAuthStore();
  const scrollViewRef = useRef<ScrollView>(null);

  const validateForm = () => {
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
        { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8 },
        { color: '#DC2626', fontSize: 14, fontWeight: '500' }
      );
      return false;
    }

    if (password.length < 6) {
      showToast(
        'Password must be at least 6 characters',
        3000,
        true,
        { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8 },
        { color: '#DC2626', fontSize: 14, fontWeight: '500' }
      );
      return false;
    }

    if (!emailRegex.test(email)) {
      showToast(
        'Please enter a valid email address',
        3000,
        true,
        { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8 },
        { color: '#DC2626', fontSize: 14, fontWeight: '500' }
      );
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!validateForm()) return;

    await register(formData);
    //TODO: Uncomment the following line to navigate to OTP screen after registration when implemented
    // router.push({
    //   pathname: '/screens/(auth)/OTPScreen',
    //   params: {
    //     verificationType: 'registration',
    //     email: formData.email,
    //   },
    // });

    const { error: registrationError } = useAuthStore.getState();

    if (!registrationError) {
      showToast(
        'Account created successfully!',
        3000,
        true,
        { backgroundColor: '#D1FAE5', padding: 12, borderRadius: 8 },
        { color: '#059669', fontSize: 14, fontWeight: '500' }
      );
      router.replace('/screens/(auth)/SignInScreen');
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 200, // Extra padding for keyboard
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          scrollEventThrottle={16}>
          <View className="px-6 pb-8 pt-4">
            {/* Header */}
            <View className="mb-8 mt-4">
              <View className="mb-4 h-16 w-16 items-center justify-center self-center rounded-full bg-blue-100">
                <MaterialIcons name="school" size={32} color="#2563EB" />
              </View>
              <Text className="mb-2 text-center text-3xl font-bold text-gray-900">
                Welcome to UniTrack
              </Text>
              <Text className="text-center text-base text-gray-600">
                Create your account to get started
              </Text>
            </View>

            {/* Form */}
            <View>
              {/* Name Row */}
              <View className="mb-5 flex-row gap-3">
                <View className="flex-1">
                  <Text className="mb-2 text-sm font-semibold text-gray-700">First Name</Text>
                  <TextInput
                    className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900"
                    placeholder="John"
                    placeholderTextColor="#9CA3AF"
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text.trim() })}
                    editable={!isLoading}
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-2 text-sm font-semibold text-gray-700">Last Name</Text>
                  <TextInput
                    className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900"
                    placeholder="Doe"
                    placeholderTextColor="#9CA3AF"
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text.trim() })}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <InputField
                label="Email Address"
                value={formData.email}
                onChangeText={(email: string) => setFormData({ ...formData, email: email.trim() })}
                placeholder="john.doe@university.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                fieldName="email"
                icon="email"
              />

              <InputField
                label="Username"
                value={formData.username}
                onChangeText={(text: string) => setFormData({ ...formData, username: text.trim() })}
                placeholder="johndoe123"
                autoCapitalize="none"
                fieldName="username"
                icon="person"
              />

              <InputField
                label="Password"
                value={formData.password}
                onChangeText={(password: string) => setFormData({ ...formData, password })}
                placeholder="Enter a secure password"
                secureTextEntry={!showPassword}
                fieldName="password"
                icon="lock"
                setShowPassword={setShowPassword}
                showPassword={showPassword}
              />

              {/* Role Selection */}
              <View className="mb-6">
                <Text className="mb-2 text-sm font-semibold text-gray-700">I am a</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setFormData({ ...formData, role: 'STUDENT' })}
                    className={`flex-1 rounded-xl border-2 px-4 py-4 ${
                      formData.role === 'STUDENT'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    disabled={isLoading}>
                    <View className="items-center">
                      <MaterialIcons
                        name="school"
                        size={24}
                        color={formData.role === 'STUDENT' ? '#2563EB' : '#9CA3AF'}
                      />
                      <Text
                        className={`mt-2 font-semibold ${
                          formData.role === 'STUDENT' ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                        Student
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setFormData({ ...formData, role: 'LECTURER' })}
                    className={`flex-1 rounded-xl border-2 px-4 py-4 ${
                      formData.role === 'LECTURER'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    disabled={isLoading}>
                    <View className="items-center">
                      <MaterialIcons
                        name="person"
                        size={24}
                        color={formData.role === 'LECTURER' ? '#2563EB' : '#9CA3AF'}
                      />
                      <Text
                        className={`mt-2 font-semibold ${
                          formData.role === 'LECTURER' ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                        Lecturer
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                className={`mt-2 rounded-xl bg-blue-600 py-4 shadow-sm ${
                  isLoading ? 'opacity-70' : ''
                }`}
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

              {/* Sign In Link */}
              <TouchableOpacity
                className="mt-6 flex-row items-center justify-center"
                activeOpacity={0.7}
                onPress={() => router.replace('/screens/(auth)/SignInScreen')}
                disabled={isLoading}>
                <Text className="text-gray-600">Already have an account? </Text>
                <Text className="font-semibold text-blue-600">Sign In</Text>
              </TouchableOpacity>

              {/* Terms */}
              <TouchableOpacity
                className="mt-6"
                activeOpacity={0.7}
                onPress={() => router.push('/screens/(legal)/legal-notice')}
                disabled={isLoading}>
                <Text className="text-center text-xs text-gray-500">
                  By creating an account, you agree to our{'\n'}
                  <Text className="text-blue-600 underline">
                    Terms of Service and Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  fieldName,
  icon,
  setShowPassword,
  showPassword,
}: any) => (
  <View className="mb-5">
    <Text className="mb-2 text-sm font-semibold text-gray-700">{label}</Text>
    <View className="relative">
      {icon && (
        <View className="pointer-events-none absolute left-3 top-3.5 z-10">
          <MaterialIcons name={icon} size={20} color="#9CA3AF" />
        </View>
      )}
      <TextInput
        className={`rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900 ${icon ? 'pl-12' : ''}`}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={true}
      />
      {fieldName === 'password' && (
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3.5"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
        </Pressable>
      )}
    </View>
  </View>
);
