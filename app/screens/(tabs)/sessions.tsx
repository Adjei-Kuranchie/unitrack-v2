import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApiStore } from '~/store/apiStore';
import { useAuthStore } from '~/store/authStore';
import { Session } from '~/types/app';

interface SessionScreenProps {
  navigation?: any;
}

const SessionScreen: React.FC<SessionScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>();

  const router = useRouter();
  const {
    sessions,
    courses,
    isLoading,
    error,
    fetchSessions,
    fetchCourses,
    createSession,
    clearError,
  } = useApiStore();

  const { role } = useAuthStore();

  useEffect(() => {
    loadData();
    requestLocationPermission();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchSessions(), fetchCourses()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateSession = async () => {
    if (!selectedCourse.trim()) {
      Alert.alert('Error', 'Please select a course');
      return;
    }

    try {
      if (!location) {
        Alert.alert('Error', 'Location is required to create a session');
        return;
      }
      await createSession({ courseName: selectedCourse, location });
      setShowCreateModal(false);
      setSelectedCourse('');
      Alert.alert('Success', 'Session created successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to create session');
    }
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSessionPress = (session: any) => {
    router.push({
      pathname: '/screens/details/session',
      params: { session: JSON.stringify(session) },
    });
  };

  const renderSessionCard = (session: Session) => {
    // Fixed: Safe property access with fallbacks
    const courseName = session.course?.courseName || 'Unknown Course';
    const courseCode = session.course?.courseCode || 'Unknown Code';
    const status = session.status || 'ACTIVE';
    const sessionId = session.id && String(session.id);
    const startTime = new Date(session.startTime);

    return (
      <TouchableOpacity
        key={sessionId} // Fixed: Ensure string key
        className="mb-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
        onPress={() => handleSessionPress(session)}>
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">{`${String(courseCode)} | ${String(courseName)}`}</Text>
            <Text className="mt-1 text-sm text-gray-500">Session #{sessionId}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-500">{formatDate(startTime)}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="rounded-full bg-blue-100 px-3 py-1">
              <Text
                className={`text-xs font-medium capitalize ${status === 'ACTIVE' ? 'text-blue-700' : 'text-gray-500'}`}>{`${status}`}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>
    );
  };

  //Implemet proper modal functionality
  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}>
      <View className="flex-1 justify-center bg-black/50 px-4">
        <View className="rounded-lg bg-white p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-col items-center rounded-md p-3">
              <Text className="text-xl font-semibold text-gray-800">Create New Session</Text>
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color={location ? '#10b981' : '#ef4444'} />
                <Text className="ml-2 text-sm text-gray-600">
                  {location
                    ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                    : locationError || 'Getting location...'}
                </Text>
              </View>
              {(locationError || !location) && (
                <TouchableOpacity
                  onPress={requestLocationPermission}
                  className="ml-2 rounded-full bg-blue-100 p-1">
                  <Ionicons name="refresh" size={20} color="#3b82f6" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text className="mb-3 text-gray-600">Select Course</Text>

          <ScrollView className="mb-4 max-h-60">
            {courses.map((course) => (
              <TouchableOpacity
                key={course.courseCode}
                className={`mb-2 rounded-lg border p-3 ${
                  selectedCourse === course.courseName
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
                onPress={() => setSelectedCourse(course.courseName)}>
                <Text
                  className={`font-medium ${
                    selectedCourse === course.courseName ? 'text-blue-700' : 'text-gray-800'
                  }`}>
                  {course.courseName}
                </Text>
                <Text
                  className={`text-sm ${
                    selectedCourse === course.courseName ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                  {course.courseCode}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 rounded-lg bg-gray-100 py-3"
              onPress={() => setShowCreateModal(false)}>
              <Text className="text-center font-medium text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-lg bg-blue-600 py-3"
              onPress={handleCreateSession}
              disabled={isLoading}>
              <Text className="text-center font-medium text-white">
                {isLoading ? 'Creating...' : 'Create Session'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const requestLocationPermission = async () => {
    try {
      setLocationError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      setLocationError('Failed to get location');
    }
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-4">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="mt-4 text-center text-lg font-medium text-red-600">{error}</Text>
        <TouchableOpacity
          className="mt-4 rounded-lg bg-blue-600 px-6 py-3"
          onPress={() => {
            clearError();
            loadData();
          }}>
          <Text className="font-medium text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-4 py-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Sessions</Text>
            <Text className="mt-1 text-gray-500">
              {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {role === 'LECTURER' && (
            <TouchableOpacity
              className="flex-row items-center rounded-lg bg-blue-600 px-4 py-2"
              onPress={() => setShowCreateModal(true)}>
              <Ionicons name="add" size={20} color="white" />
              <Text className="ml-1 font-medium text-white">New</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* TODO:Fix the UI for here */}
      {/* Location Status */}
      {/* <View className="mb-4">
        <Text className="mb-2 text-sm font-medium text-gray-700">Current Location</Text>
        <View className="flex-row items-center rounded-md bg-gray-50 p-3">
          <Ionicons name="location" size={20} color={location ? '#10b981' : '#ef4444'} />
          <Text className="ml-2 flex-1 text-sm text-gray-600">
            {location
              ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
              : locationError || 'Getting location...'}
          </Text>
          {(locationError || !location) && (
            <TouchableOpacity
              onPress={requestLocationPermission}
              className="ml-2 rounded-full bg-blue-100 p-1">
              <Ionicons name="refresh" size={20} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </View>

        {locationError && (
          <TouchableOpacity
            onPress={requestLocationPermission}
            className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2">
            <View className="flex-row items-center justify-center">
              <Ionicons name="location" size={16} color="#3b82f6" />
              <Text className="ml-2 font-medium text-blue-600">Retry Location Access</Text>
            </View>
          </TouchableOpacity>
        )}
      </View> */}

      {/* Sessions List */}
      {/* Stats Card */}
      <View className="mt-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <Text className="mb-3 text-lg font-semibold text-gray-800">Quick Stats</Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">{sessions.length}</Text>
            <Text className="text-sm text-gray-500">Total Sessions</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">{courses.length}</Text>
            <Text className="text-sm text-gray-500">Courses</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-purple-600">
              {
                sessions.filter((s) => {
                  const today = new Date();
                  const sessionDate = new Date(s.startTime);
                  return sessionDate.toDateString() === today.toDateString();
                }).length
              }
            </Text>
            <Text className="text-sm text-gray-500">Today</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {isLoading && sessions.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="reload-outline" size={48} color="#6B7280" />
            <Text className="mt-4 text-gray-500">Loading sessions...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="school-outline" size={64} color="#6B7280" />
            <Text className="mt-4 text-lg font-medium text-gray-600">No Sessions Yet</Text>
            <Text className="mt-2 px-8 text-center text-gray-500">
              {role === 'LECTURER'
                ? 'Create your first session to get started'
                : 'No active sessions available'}
            </Text>
            {role === 'LECTURER' && (
              <TouchableOpacity
                className="mt-6 rounded-lg bg-blue-600 px-6 py-3"
                onPress={() => setShowCreateModal(true)}>
                <Text className="font-medium text-white">Create Session</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {sessions
              .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
              .map(renderSessionCard)}
          </>
        )}
      </ScrollView>

      {renderCreateModal()}
    </View>
  );
};

export default SessionScreen;
