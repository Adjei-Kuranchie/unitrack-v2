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
}

export default function ProfileScreen() {
  const { user, signOut, token } = useAuthStore();
  const { updateUser, fetchUserProfile, deleteUser, isLoading, error, clearError } = useApiStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [isStudent, setIsStudent] = useState(user?.role === 'STUDENT');
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile fields configuration
  const profileFields: EditableField[] = [
    { key: 'firstName', label: 'First Name', value: user?.firstName || '', editable: true },
    { key: 'lastName', label: 'Last Name', value: user?.lastName || '', editable: true },
    { key: 'email', label: 'Email', value: user?.email || '', editable: true },
    { key: 'username', label: 'Username', value: user?.username || '', editable: false },
    { key: 'program', label: 'Program', value: user?.program || '', editable: true },
    { key: 'IndexNumber', label: 'Index Number', value: user?.IndexNumber || '', editable: false },
  ];

  useEffect(() => {
    // Update isStudent when user data changes
    setIsStudent(user?.role === 'STUDENT');
  }, [user?.role]);

  const filteredFields = isStudent
    ? profileFields
    : profileFields.filter((f) => f.key !== 'program' && f.key !== 'IndexNumber');

  useEffect(() => {
    // Fetch user profile when component mounts if user is not already loaded
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
    // Initialize edited fields with current values
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
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Final Confirmation',
      'This will permanently delete your account and all associated data. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: executeDeleteAccount,
        },
      ]
    );
  };

  const executeDeleteAccount = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Unable to delete account. User ID not found.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      Alert.alert('Account Deleted', 'Your account has been successfully deleted.', [
        {
          text: 'OK',
          onPress: () => {
            // Sign out the user after successful deletion
            signOut();
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
      console.error('Delete account error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setEditedFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  console.log(user);
  if (!token) {
    return (
      <View className="flex-1 bg-gray-100">
        <Text className="mt-12 text-center text-base text-red-500">
          Please sign in to view your profile
        </Text>
      </View>
    );
  }

  if (profileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-base text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-gray-100">
        <View className="mt-12 items-center px-5">
          <Text className="mb-4 text-center text-base text-red-500">
            Failed to load profile data
          </Text>
          <TouchableOpacity onPress={loadUserProfile} className="rounded-md bg-blue-500 px-4 py-2">
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="items-center border-b border-gray-200 bg-white px-5 py-8">
        <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-blue-500">
          <Text className="text-4xl font-bold text-white">
            {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text className="mb-1 text-2xl font-bold text-gray-800">
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.username || 'User'}
        </Text>
        <Text className="text-base capitalize text-gray-600">{user.role || 'Student'}</Text>
      </View>

      <View className="mt-5 bg-white px-5 py-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-800">Profile Information</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={handleEdit} className="rounded-md bg-blue-500 px-4 py-2">
              <Text className="font-medium text-white">Edit</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={handleCancel} className="rounded-md bg-gray-500 px-4 py-2">
                <Text className="font-medium text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="min-w-[60px] items-center rounded-md bg-green-500 px-4 py-2">
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="font-medium text-white">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {filteredFields.map((field) => (
          <View key={field.key} className="mb-5">
            <Text className="mb-1 text-sm font-medium text-gray-600">{field.label}</Text>
            {isEditing && field.editable ? (
              <TextInput
                className="rounded-md border border-blue-500 bg-gray-50 px-3 py-3 text-base text-gray-800"
                value={editedFields[field.key] || field.value}
                onChangeText={(text) => updateField(field.key, text)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            ) : (
              <Text className="border-b border-gray-100 py-3 text-base text-gray-800">
                {field.value || 'Not provided'}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View className="mt-5 bg-white px-5 py-4">
        <Text className="mb-3 text-lg font-semibold text-gray-800">Account Actions</Text>

        <TouchableOpacity
          onPress={handleSignOut}
          className="mb-3 items-center rounded-lg bg-red-500 py-4">
          <Text className="text-base font-semibold text-white">Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          disabled={isDeleting}
          className="items-center rounded-lg bg-red-700 py-4">
          {isDeleting ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#ffffff" size="small" />
              <Text className="ml-2 text-base font-semibold text-white">Deleting...</Text>
            </View>
          ) : (
            <Text className="text-base font-semibold text-white">Delete Account</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="items-center py-8">
        <Text className="text-sm text-gray-500">Member since {new Date().getFullYear()}</Text>
      </View>
    </ScrollView>
  );
}
