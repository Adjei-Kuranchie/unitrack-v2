import { Feather } from '@expo/vector-icons';
import { showToast } from 'au-react-native-toast';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const { height } = Dimensions.get('window');

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { signIn, isLoading, error, clearError } = useAuthStore();

  const handleSignIn = async () => {
    Keyboard.dismiss();

    if (!username.trim() || !password.trim()) {
      showToast(
        'Please enter your username and password',
        3000,
        true,
        {
          backgroundColor: '#FEF2F2',
          padding: 14,
          borderRadius: 12,
          marginHorizontal: 20,
        },
        {
          color: '#DC2626',
          fontSize: 14,
          fontWeight: '600',
        }
      );
      return;
    }

    await signIn(username, password);

    const { user, resMessage } = useAuthStore.getState();
    if (resMessage) {
      showToast(
        'Welcome back!',
        2000,
        true,
        {
          backgroundColor: '#F0FDF4',
          padding: 14,
          borderRadius: 12,
          marginHorizontal: 20,
        },
        {
          color: '#16A34A',
          fontSize: 14,
          fontWeight: '600',
        }
      );
      router.replace('/screens/(tabs)/dashboard');
    }
  };

  const getInputStyle = (fieldName: string) => {
    const isFocused = focusedField === fieldName;
    const baseStyle = 'rounded-2xl px-5 py-5 text-base text-gray-900';

    if (isFocused) {
      return `${baseStyle} bg-white border-2 border-blue-500`;
    }
    return `${baseStyle} bg-gray-50 border-2 border-transparent`;
  };

  useEffect(() => {
    if (error) {
      showToast(
        error,
        4000,
        true,
        {
          backgroundColor: '#FEF2F2',
          padding: 14,
          borderRadius: 12,
          marginHorizontal: 20,
        },
        {
          color: '#DC2626',
          fontSize: 14,
          fontWeight: '600',
        }
      );
      clearError();
    }
  }, [error]);

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
          <View className="flex-1 justify-center px-8 ">
            {/* Logo and Welcome Section */}
            <View className="mb-12 items-center">
              <Text className="mb-3 text-4xl font-bold text-gray-900">UniTrack</Text>
              <Text className="text-lg text-gray-600">Welcome back!</Text>
              <Text className="mt-1 text-base text-gray-500">Sign in to continue</Text>
            </View>

            {/* Form Section */}
            <View className="space-y-5">
              {/* Username Field */}
              <View>
                <Text className="mb-3 ml-2 text-sm font-semibold text-gray-700">USERNAME</Text>
                <View className="relative">
                  <View className="absolute left-5 top-5 z-10">
                    <Feather
                      name="user"
                      size={22}
                      color={focusedField === 'username' ? '#3B82F6' : '#9CA3AF'}
                    />
                  </View>
                  <TextInput
                    className={`${getInputStyle('username')} pl-14 text-base`}
                    placeholder="Enter your username"
                    placeholderTextColor="#9CA3AF"
                    value={username}
                    onChangeText={setUsername}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View>
                <Text className="mb-3 ml-2 text-sm font-semibold text-gray-700">PASSWORD</Text>
                <View className="relative">
                  <View className="absolute left-5 top-5 z-10">
                    <Feather
                      name="lock"
                      size={22}
                      color={focusedField === 'password' ? '#3B82F6' : '#9CA3AF'}
                    />
                  </View>
                  <TextInput
                    className={`${getInputStyle('password')} pl-14 pr-14 text-base`}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleSignIn}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-5 h-8 w-8 items-center justify-center"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={22} color="#9CA3AF" />
                  </Pressable>
                </View>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                activeOpacity={0.9}
                className={`mt-8 overflow-hidden rounded-2xl shadow-lg ${
                  isLoading ? 'opacity-70' : ''
                }`}
                onPress={handleSignIn}
                disabled={isLoading}
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                }}>
                <View className="bg-blue-600 px-8 py-5">
                  {isLoading ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator color="white" size="small" />
                      <Text className="ml-3 text-center text-lg font-semibold text-white">
                        Signing in...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-center text-lg font-semibold text-white">Sign In</Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Create Account Section */}
              <View className="mt-10 items-center">
                <Text className="mb-3 text-base text-gray-600">Don&apos;t have an account?</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push('/screens/(auth)/RegisterScreen')}
                  disabled={isLoading}
                  className="rounded-2xl border-2 border-blue-600 bg-blue-50 px-8 py-4">
                  <Text className="text-base font-bold text-blue-600">Create New Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
