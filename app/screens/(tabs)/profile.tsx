/**
 * Enhanced ProfileScreen component with modern UI/UX improvements matching CoursesScreen style.
 *
 * New Features:
 * - Modern solid color header with user avatar and role badge
 * - Enhanced profile cards with better visual hierarchy and icons
 * - Improved edit mode with modern form styling
 * - Better loading states and error handling
 * - Enhanced action buttons with icons
 * - Improved color scheme and typography throughout
 * - Role-based field visibility with better organization
 * - Modern card-based layout with shadows and rounded corners
 *
 * @component
 * @returns {JSX.Element} The enhanced ProfileScreen component.
 */

import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApiStore } from '~/store/apiStore';
import { useAuthStore } from '~/store/authStore';

interface EditableField {
  key: string;
  label: string;
  value: string;
  editable: boolean;
  icon: string;
  placeholder?: string;
}

export default function ProfileScreen() {
  const { user, signOut, token, role } = useAuthStore();
  const { updateUser, fetchUserProfile, isLoading, error, clearError } = useApiStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [isStudent, setIsStudent] = useState(user?.role === 'STUDENT');

  // Enhanced profile fields configuration with icons
  const profileFields: EditableField[] = [
    {
      key: 'firstName',
      label: 'First Name',
      value: user?.firstName || '',
      editable: true,
      icon: 'person',
      placeholder: 'Enter your first name',
    },
    {
      key: 'lastName',
      label: 'Last Name',
      value: user?.lastName || '',
      editable: true,
      icon: 'person',
      placeholder: 'Enter your last name',
    },
    {
      key: 'email',
      label: 'Email Address',
      value: user?.email || '',
      editable: false,
      icon: 'email',
    },
    {
      key: 'username',
      label: 'Username',
      value: user?.username || '',
      editable: false,
      icon: 'account-circle',
    },
    {
      key: 'program',
      label: 'Program',
      value: user?.program || '',
      editable: false,
      icon: 'school',
    },
    {
      key: 'IndexNumber',
      label: 'Index Number',
      value: user?.IndexNumber || '',
      editable: false,
      icon: 'badge',
    },
  ];

  useEffect(() => {
    setIsStudent(role === 'STUDENT');
  }, [role]);

  const filteredFields = !isStudent
    ? profileFields.filter((f) => f.key !== 'program' && f.key !== 'IndexNumber')
    : profileFields;

  useEffect(() => {
    if (token && !user) {
      loadUserProfile();
    }
  }, [token, user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const loadUserProfile = async () => {
    if (!token) return;

    setProfileLoading(true);
    try {
      await fetchUserProfile();
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    const initialFields: Record<string, string> = {};
    profileFields.forEach((field) => {
      if (field.editable) {
        initialFields[field.key] = field.value;
      }
    });
    setEditedFields(initialFields);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedFields({});
  };

  const handleSave = async () => {
    try {
      await updateUser({
        id: user?.id,
        ...editedFields,
      });
      setIsEditing(false);
      setEditedFields({});
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          setTimeout(() => {
            router.replace('/screens/(auth)/SignInScreen');
          }, 100);
        },
      },
    ]);
  };

  const updateField = (key: string, value: string) => {
    setEditedFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';
  };

  const getProfileColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = (user?.firstName?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  if (!token) {
    return (
      <View className="flex-1 bg-slate-50">
        <View className="bg-red-500 px-4 pb-6 pt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">Profile</Text>
              <Text className="text-sm text-red-100">Authentication required</Text>
            </View>
            <View className="rounded-full bg-white/20 p-3">
              <MaterialIcons name="person" size={28} color="white" />
            </View>
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-6 rounded-full bg-red-100 p-8">
            <MaterialIcons name="lock" size={64} color="#ef4444" />
          </View>
          <Text className="mb-2 text-xl font-bold text-gray-900">Authentication Required</Text>
          <Text className="text-center text-gray-600">
            Please sign in to view your profile information
          </Text>
        </View>
      </View>
    );
  }

  if (profileLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <View className="bg-blue-600 px-4 pb-6 pt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">Profile</Text>
              <Text className="text-sm text-blue-100">Loading your information</Text>
            </View>
            <View className="rounded-full bg-white/20 p-3">
              <MaterialIcons name="person" size={28} color="white" />
            </View>
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <View className="mb-4 rounded-full bg-blue-100 p-4">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
          <Text className="text-lg font-medium text-gray-900">Loading profile...</Text>
          <Text className="text-sm text-gray-600">Please wait while we fetch your information</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-slate-50">
        <View className="bg-red-500 px-4 pb-6 pt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">Profile</Text>
              <Text className="text-sm text-red-100">Failed to load</Text>
            </View>
            <View className="rounded-full bg-white/20 p-3">
              <MaterialIcons name="error" size={28} color="white" />
            </View>
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-6 rounded-full bg-red-100 p-8">
            <MaterialIcons name="error-outline" size={64} color="#ef4444" />
          </View>
          <Text className="mb-2 text-xl font-bold text-gray-900">Failed to Load Profile</Text>
          <Text className="mb-6 text-center text-gray-600">
            Unable to retrieve your profile information
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={loadUserProfile}
            className="rounded-xl bg-blue-600 px-6 py-3 shadow-lg">
            <View className="flex-row items-center">
              <MaterialIcons name="refresh" size={20} color="white" />
              <Text className="ml-2 font-semibold text-white">Try Again</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Enhanced Header */}
      <View className="bg-blue-600 px-4 pb-6 pt-14 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Profile</Text>
            <Text className="text-sm text-blue-100">
              {isStudent ? 'Student' : 'Lecturer'} Account
            </Text>
          </View>
          <View className="rounded-full bg-white/20 p-3">
            <MaterialIcons name="person" size={28} color="white" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <View className="mx-4 mt-6 overflow-hidden rounded-2xl bg-white shadow-lg">
          <View className="items-center px-6 py-8">
            <View
              className={`mb-4 h-24 w-24 items-center justify-center rounded-full ${getProfileColor()}`}>
              <Text className="text-3xl font-bold text-white">{getUserInitials()}</Text>
            </View>
            <Text className="mb-1 text-2xl font-bold text-gray-900">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName || user.username || 'User'}
            </Text>
            <View className="flex-row items-center">
              <View className="mr-2 rounded-full bg-blue-100 p-1">
                <MaterialIcons name={isStudent ? 'school' : 'work'} size={14} color="#3b82f6" />
              </View>
              <Text className="text-base font-medium capitalize text-blue-600">
                {isStudent ? 'student' : 'lecturer'}
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Information Card */}
        <View className="mx-4 mt-6 overflow-hidden rounded-2xl bg-white shadow-lg">
          <View className="border-b border-gray-100 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 rounded-full bg-blue-100 p-2">
                  <MaterialIcons name="info" size={20} color="#3b82f6" />
                </View>
                <Text className="text-xl font-bold text-gray-900">Personal Information</Text>
              </View>
              {!isEditing ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleEdit}
                  className="rounded-xl bg-blue-600 px-4 py-2 shadow-sm">
                  <View className="flex-row items-center">
                    <MaterialIcons name="edit" size={16} color="white" />
                    <Text className="ml-1 font-medium text-white">Edit</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleCancel}
                    className="rounded-xl bg-gray-500 px-4 py-2">
                    <View className="flex-row items-center">
                      <MaterialIcons name="close" size={16} color="white" />
                      <Text className="ml-1 font-medium text-white">Cancel</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleSave}
                    className="min-w-[80px] items-center rounded-xl bg-green-600 px-4 py-2">
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <View className="flex-row items-center">
                        <MaterialIcons name="check" size={16} color="white" />
                        <Text className="ml-1 font-medium text-white">Save</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View className="px-6 py-4">
            {filteredFields.map((field, index) => (
              <View
                key={field.key}
                className={`${index !== filteredFields.length - 1 ? 'mb-6' : ''}`}>
                <View className="mb-3 flex-row items-center">
                  <View className="mr-3 rounded-full bg-gray-100 p-2">
                    <MaterialIcons name={field.icon as any} size={16} color="#6b7280" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">{field.label}</Text>
                </View>

                {isEditing && field.editable ? (
                  <View className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <TextInput
                      className="text-base text-gray-900"
                      value={editedFields[field.key] || field.value}
                      onChangeText={(text) => updateField(field.key, text)}
                      placeholder={field.placeholder}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                ) : (
                  <View className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <Text className="text-base text-gray-900">{field.value || 'Not provided'}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Account Actions Card */}
        <View className="mx-4 mt-6 overflow-hidden rounded-2xl bg-white shadow-lg">
          <View className="border-b border-gray-100 px-6 py-4">
            <View className="flex-row items-center">
              <View className="mr-3 rounded-full bg-red-100 p-2">
                <MaterialIcons name="settings" size={20} color="#ef4444" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Account Actions</Text>
            </View>
          </View>

          <View className="px-6 py-4">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSignOut}
              className="items-center rounded-xl bg-red-600 py-4 shadow-sm">
              <View className="flex-row items-center">
                <MaterialIcons name="logout" size={20} color="white" />
                <Text className="ml-2 text-base font-semibold text-white">Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center px-6 py-8">
          <View className="flex-row items-center">
            <View className="mr-2 rounded-full bg-gray-100 p-1">
              <MaterialIcons name="calendar-today" size={14} color="#6b7280" />
            </View>
            <Text className="text-sm text-gray-500">Member since {new Date().getFullYear()}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
