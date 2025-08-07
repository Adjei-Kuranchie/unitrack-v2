import { MaterialIcons } from '@expo/vector-icons';
import { showToast } from 'au-react-native-toast';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

interface OTPScreenProps {
  phoneNumber?: string;
  email?: string;
  verificationType?: 'registration' | 'login' | 'reset_password';
}

export default function OTPScreen({
  email = 'user@example.com',
  verificationType = 'registration',
}: OTPScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Start timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOTPChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all fields are filled
    if (value && index === 5 && newOtp.every((digit) => digit !== '')) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');

    if (otpToVerify.length !== 6) {
      showToast(
        'Please enter the complete 6-digit code',
        3000,
        true,
        { backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12 },
        { color: '#DC2626', fontSize: 14, fontWeight: '600' }
      );
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success/failure
      const isValid = otpToVerify === '123456'; // Mock validation

      if (isValid) {
        showToast(
          'Verification successful!',
          2000,
          true,
          { backgroundColor: '#F0FDF4', padding: 14, borderRadius: 12 },
          { color: '#16A34A', fontSize: 14, fontWeight: '600' }
        );

        // Navigate based on verification type
        setTimeout(() => {
          switch (verificationType) {
            case 'registration':
              router.replace('/screens/(auth)/SignInScreen');
              break;
            case 'login':
              router.replace('/screens/(tabs)/dashboard');
              break;
            // case 'reset_password':
            //   router.push('/screens/(auth)/ResetPasswordScreen');
            //   break;
            default:
              router.replace('/screens/(tabs)/dashboard');
          }
        }, 1000);
      } else {
        showToast(
          'Invalid verification code. Please try again.',
          3000,
          true,
          { backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12 },
          { color: '#DC2626', fontSize: 14, fontWeight: '600' }
        );
        // Clear OTP on failure
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      showToast(
        'Verification failed. Please try again.',
        3000,
        true,
        { backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12 },
        { color: '#DC2626', fontSize: 14, fontWeight: '600' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsResending(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast(
        'Verification code sent successfully!',
        3000,
        true,
        { backgroundColor: '#F0FDF4', padding: 14, borderRadius: 12 },
        { color: '#16A34A', fontSize: 14, fontWeight: '600' }
      );

      // Reset timer and states
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      showToast(
        'Failed to resend code. Please try again.',
        3000,
        true,
        { backgroundColor: '#FEF2F2', padding: 14, borderRadius: 12 },
        { color: '#DC2626', fontSize: 14, fontWeight: '600' }
      );
    } finally {
      setIsResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVerificationText = () => {
    switch (verificationType) {
      case 'registration':
        return 'Complete your registration';
      case 'login':
        return 'Verify your identity';
      case 'reset_password':
        return 'Reset your password';
      default:
        return 'Verify your account';
    }
  };

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
            {/* Header */}
            <View className="mb-12 items-center">
              <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-blue-100">
                <MaterialIcons name="security" size={48} color="#2563EB" />
              </View>
              <Text className="mb-3 text-3xl font-bold text-gray-900">Verify Your Account</Text>
              <Text className="mb-2 text-center text-base text-gray-600">
                {getVerificationText()}
              </Text>
              <Text className="text-center text-sm text-gray-500">
                We&apos;ve sent a 6-digit code to{'\n'}
                <Text className="font-semibold text-blue-600">{email}</Text>
              </Text>
            </View>

            {/* OTP Input Fields */}
            <View className="mb-8">
              <Text className="mb-4 text-center text-sm font-medium text-gray-700">
                Enter verification code
              </Text>
              <View className="flex-row justify-center space-x-3">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    className={`mx-2 h-14 w-12 rounded-xl border-2 text-center text-xl font-bold text-gray-900 ${
                      digit ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                    value={digit}
                    onChangeText={(value) => handleOTPChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    editable={!isLoading}
                    selectTextOnFocus
                  />
                ))}
              </View>
            </View>

            {/* Timer and Resend */}
            <View className="mb-8 items-center">
              {!canResend ? (
                <View className="flex-row items-center">
                  <MaterialIcons name="timer" size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm text-gray-600">
                    Resend code in {formatTimer(timer)}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleResendOTP}
                  disabled={isResending}
                  className="flex-row items-center">
                  {isResending ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <MaterialIcons name="refresh" size={16} color="#2563EB" />
                  )}
                  <Text
                    className={`ml-2 text-sm font-semibold ${isResending ? 'text-gray-400' : 'text-blue-600'}`}>
                    {isResending ? 'Sending...' : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleVerifyOTP()}
              disabled={isLoading || otp.some((digit) => !digit)}
              className={`rounded-2xl px-8 py-4 ${
                isLoading || otp.some((digit) => !digit) ? 'bg-gray-300' : 'bg-blue-600'
              }`}>
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="ml-2 text-center text-lg font-semibold text-white">
                    Verifying...
                  </Text>
                </View>
              ) : (
                <Text className="text-center text-lg font-semibold text-white">Verify Code</Text>
              )}
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              disabled={isLoading}
              className="mt-6 items-center">
              <Text className="text-base font-semibold text-gray-600">Back to Previous Screen</Text>
            </TouchableOpacity>

            {/* Help Text */}
            <View className="mt-8 items-center">
              <Text className="text-center text-xs text-gray-500">
                Didn&apos;t receive the code? Check your spam folder or{'\n'}
                make sure your contact information is correct.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
