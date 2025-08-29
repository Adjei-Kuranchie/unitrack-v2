import { MaterialIcons } from '@expo/vector-icons';
import { showToast } from 'au-react-native-toast';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '~/store/authStore';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    // Validate email
    if (!email.trim()) {
      showToast(
        'Please enter your email address',
        3000,
        true,
        { backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12 },
        { color: '#DC2626', fontSize: 14, fontWeight: '600' }
      );
      return;
    }

    if (!validateEmail(email)) {
      showToast(
        'Please enter a valid email address',
        3000,
        true,
        { backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12 },
        { color: '#DC2626', fontSize: 14, fontWeight: '600' }
      );
      return;
    }

    Keyboard.dismiss();

    // Call the forgotPassword function from the store
    const success = await forgotPassword(email);

    if (success) {
      // Show success message
      setIsEmailSent(true);
      showToast(
        'Password reset link sent successfully! Check your email.',
        5000,
        true,
        { backgroundColor: '#F0FDF4', padding: 14, borderRadius: 12 },
        { color: '#16A34A', fontSize: 14, fontWeight: '600' }
      );

      // Optionally redirect after a delay
      setTimeout(() => {
        router.replace('/screens/(auth)/SignInScreen');
      }, 5000);
    } else {
      // Error is handled by the useEffect above, but we can also show a toast
      const currentError = useAuthStore.getState().error;
      showToast(
        currentError || 'Failed to send reset link. Please try again.',
        3000,
        true,
        { backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12 },
        { color: '#DC2626', fontSize: 14, fontWeight: '600' }
      );
    }
  };

  const handleResendEmail = async () => {
    const success = await forgotPassword(email);

    if (success) {
      showToast(
        'Reset link resent to your email!',
        3000,
        true,
        { backgroundColor: '#F0FDF4', padding: 14, borderRadius: 12 },
        { color: '#16A34A', fontSize: 14, fontWeight: '600' }
      );
    } else {
      const currentError = useAuthStore.getState().error;
      showToast(
        currentError || 'Failed to resend email. Please try again.',
        3000,
        true,
        { backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12 },
        { color: '#DC2626', fontSize: 14, fontWeight: '600' }
      );
    }
  };

  if (isEmailSent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center px-6 py-8">
            {/* Success State */}
            <View className="items-center">
              <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <MaterialIcons name="check-circle" size={48} color="#16A34A" />
              </View>
              <Text className="mb-3 text-3xl font-bold text-gray-900">Check Your Email</Text>
              <Text className="mb-2 text-center text-base text-gray-600">
                We've sent a password reset link to
              </Text>
              <Text className="mb-8 text-center text-base font-semibold text-blue-600">
                {email}
              </Text>

              <View className="mb-8 rounded-xl bg-gray-50 p-4">
                <Text className="text-center text-sm text-gray-600">
                  Please check your email and click on the link to reset your password. The link
                  will expire in 1 hour.
                </Text>
              </View>

              {/* Resend Email Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleResendEmail}
                disabled={isLoading}
                className="mb-4 w-full rounded-2xl bg-blue-600 px-8 py-4">
                {isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="ml-2 text-center text-lg font-semibold text-white">
                      Sending...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-center text-lg font-semibold text-white">Resend Email</Text>
                )}
              </TouchableOpacity>

              {/* Back to Sign In Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.replace('/screens/(auth)/SignInScreen')}
                disabled={isLoading}
                className="mt-2">
                <Text className="text-base font-semibold text-blue-600">Back to Sign In</Text>
              </TouchableOpacity>

              {/* Help Text */}
              <View className="mt-8">
                <Text className="text-center text-xs text-gray-500">
                  Didn't receive the email? Check your spam folder or{'\n'}
                  make sure you entered the correct email address.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-8">
            {/* Back Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              disabled={isLoading}
              className="absolute left-6 top-12 z-10">
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-12 items-center">
              <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-blue-100">
                <MaterialIcons name="lock-reset" size={48} color="#2563EB" />
              </View>
              <Text className="mb-3 text-3xl font-bold text-gray-900">Forgot Password?</Text>
              <Text className="text-center text-base text-gray-600">
                No worries! Enter your email address and we'll send you{'\n'}
                instructions to reset your password.
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-8">
              <Text className="mb-2 text-sm font-semibold text-gray-700">Email Address</Text>
              <View className="relative">
                <View className="pointer-events-none absolute left-3 top-3.5 z-10">
                  <MaterialIcons name="email" size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 pl-12 text-base text-gray-900"
                  placeholder="john.doe@university.edu"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => setEmail(text.trim())}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              <Text className="mt-2 text-xs text-gray-500">
                Enter the email address associated with your account
              </Text>
            </View>

            {/* Info Box */}
            <View className="mb-8 rounded-xl bg-blue-50 p-4">
              <View className="flex-row">
                <MaterialIcons name="info" size={20} color="#2563EB" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-blue-900">How it works:</Text>
                  <Text className="mt-1 text-xs text-blue-700">
                    • We'll send a password reset link to your email{'\n'}• Click the link in the
                    email to create a new password{'\n'}• The link will expire after 1 hour for
                    security
                  </Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleResetPassword}
              disabled={isLoading || !email.trim()}
              className={`rounded-2xl px-8 py-4 ${
                isLoading || !email.trim() ? 'bg-gray-300' : 'bg-blue-600'
              }`}>
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="ml-2 text-center text-lg font-semibold text-white">
                    Sending...
                  </Text>
                </View>
              ) : (
                <Text className="text-center text-lg font-semibold text-white">
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>

            {/* Back to Sign In */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              disabled={isLoading}
              className="mt-6 flex-row items-center justify-center">
              <MaterialIcons name="arrow-back" size={20} color="#4B5563" />
              <Text className="ml-2 text-base font-semibold text-gray-600">Back to Sign In</Text>
            </TouchableOpacity>

            {/* Alternative Help */}
            <View className="mt-12 items-center">
              <Text className="mb-3 text-sm text-gray-500">Need help?</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  // Navigate to support or contact page
                  showToast(
                    'Contact support at support@unitracker.edu',
                    3000,
                    true,
                    { backgroundColor: '#F3F4F6', padding: 14, borderRadius: 12 },
                    { color: '#374151', fontSize: 14, fontWeight: '500' }
                  );
                }}>
                <Text className="text-sm font-semibold text-blue-600">Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
