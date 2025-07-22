/**
 * Enhanced SessionScreen component with modern UI/UX improvements matching CoursesScreen.
 *
 * New Features:
 * - Modern solid color header matching CoursesScreen design
 * - Enhanced session cards with better visual hierarchy and status indicators
 * - Improved search functionality with modern styling
 * - Better empty states with engaging illustrations
 * - Enhanced location status display
 * - Improved modal design with better form layout
 * - Better loading states and error handling
 * - Enhanced stats cards with icons and animations
 * - Modern floating action button for lecturers
 * - Better color scheme and typography throughout
 *
 * @component
 */

import { Ionicons } from '@expo/vector-icons';
import { showToast } from 'au-react-native-toast';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatDate } from '~/lib/utils';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const { role, user } = useAuthStore();

  useEffect(() => {
    loadData();
    requestLocationPermission();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchSessions(), fetchCourses()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await requestLocationPermission();
    await loadData();
    setRefreshing(false);
  };

  const handleCreateSession = async () => {
    if (!selectedCourse.trim()) {
      showToast(
        'Please select a course.',
        3000,
        true,
        { backgroundColor: 'pink', padding: 5 },
        { color: 'red', fontSize: 15 }
      );
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

      showToast(
        'Session created successfully',
        3000,
        true,
        { backgroundColor: '#C0FFCB', padding: 5 },
        { color: 'green', fontSize: 15 }
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to create session');
    }
  };

  const handleSessionPress = (session: Session) => {
    router.push({
      pathname: '/screens/details/session',
      params: { session: JSON.stringify(session) },
    });
  };

  const requestLocationPermission = async () => {
    try {
      setLocationError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      setLocationError('Failed to get location');
    }
  };

  // Filter sessions based on search query
  const filteredSessions = sessions
    .filter((session) => session.lecturer?.email === user?.email)
    .filter((session) => {
      const courseName = session.course?.courseName || '';
      const courseCode = session.course?.courseCode || '';
      const searchLower = searchQuery.toLowerCase();
      return (
        courseName.toLowerCase().includes(searchLower) ||
        courseCode.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const renderSessionCard = ({ item: session }: { item: Session }) => {
    const courseName = session.course?.courseName || 'Unknown Course';
    const courseCode = session.course?.courseCode || 'Unknown Code';
    const status = session.status || 'ACTIVE';
    const sessionId = session.id && String(session.id);
    const startTime = new Date(session.startTime);

    // Generate color based on status
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'ACTIVE':
          return '#10b981'; // green
        case 'COMPLETED':
          return '#3b82f6'; // blue
        case 'CANCELLED':
          return '#ef4444'; // red
        default:
          return '#6b7280'; // gray
      }
    };

    const statusColor = getStatusColor(status);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className="mx-4 mb-3 flex-row items-center rounded-xl bg-white p-4 shadow-sm"
        onPress={() => handleSessionPress(session)}>
        {/* Status indicator */}
        <View className="mr-3 h-12 w-1 rounded-full" style={{ backgroundColor: statusColor }} />

        {/* Main content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                {courseCode} - {courseName}
              </Text>
              <View className="mt-1 flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#6b7280" />
                <Text className="ml-1 text-xs text-gray-500">{formatDate(String(startTime))}</Text>
                {status === 'ACTIVE' && (
                  <>
                    <View className="mx-2 h-1 w-1 rounded-full bg-gray-400" />
                    <View className="flex-row items-center">
                      <View className="mr-1 h-2 w-2 rounded-full bg-green-500" />
                      <Text className="text-xs font-medium text-green-600">Live</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Arrow icon */}
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStatsCard = () => {
    const todaySessions = sessions.filter((s) => {
      const today = new Date();
      const sessionDate = new Date(s.startTime);
      return sessionDate.toDateString() === today.toDateString();
    }).length;

    const activeSessions = sessions.filter((s) => s.status === 'ACTIVE').length;

    return (
      <View className="mx-4 mb-4 rounded-2xl bg-white p-4 shadow-lg">
        <Text className="mb-4 text-lg font-semibold text-gray-900">Quick Stats</Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <View className="mb-2 rounded-full bg-blue-100 p-3">
              <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
            </View>
            <Text className="text-2xl font-bold text-blue-600">{sessions.length}</Text>
            <Text className="text-sm text-gray-500">Total Sessions</Text>
          </View>
          <View className="items-center">
            <View className="mb-2 rounded-full bg-green-100 p-3">
              <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
            </View>
            <Text className="text-2xl font-bold text-green-600">{activeSessions}</Text>
            <Text className="text-sm text-gray-500">Active</Text>
          </View>
          <View className="items-center">
            <View className="mb-2 rounded-full bg-purple-100 p-3">
              <Ionicons name="today-outline" size={20} color="#8b5cf6" />
            </View>
            <Text className="text-2xl font-bold text-purple-600">{todaySessions}</Text>
            <Text className="text-sm text-gray-500">Today</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderLocationStatus = () => (
    <View className="mx-4 mb-4 rounded-2xl bg-white p-4 shadow-lg">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-900">Location Status</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={requestLocationPermission}
          className="rounded-full bg-blue-100 p-2">
          <Ionicons name="refresh" size={16} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center">
        <View className={`mr-3 rounded-full p-2 ${location ? 'bg-green-100' : 'bg-red-100'}`}>
          <Ionicons name="location-outline" size={20} color={location ? '#10b981' : '#ef4444'} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-900">
            {location ? 'Location Available' : 'Location Unavailable'}
          </Text>
          <Text className="text-xs text-gray-500">
            {location
              ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
              : locationError || 'Getting location...'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="mb-6 rounded-full bg-indigo-100 p-8">
        <Ionicons name="school-outline" size={64} color="#6366f1" />
      </View>
      <Text className="mb-2 text-xl font-bold text-gray-900">
        {searchQuery ? 'No sessions found' : 'No sessions available'}
      </Text>
      <Text className="mb-6 text-center text-gray-600">
        {searchQuery
          ? `No sessions match "${searchQuery}"`
          : role === 'LECTURER'
            ? 'Create your first session to get started'
            : 'No active sessions available at the moment'}
      </Text>
      {role === 'LECTURER' && !searchQuery && (
        <TouchableOpacity
          activeOpacity={0.7}
          className="rounded-xl bg-indigo-600 px-6 py-3 shadow-lg"
          onPress={() => setShowCreateModal(true)}>
          <View className="flex-row items-center">
            <Ionicons name="add" size={20} color="white" />
            <Text className="ml-2 font-semibold text-white">Create Your First Session</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}>
      <View className="flex-1 justify-center bg-black/50 px-4">
        <View className="rounded-2xl bg-white shadow-xl">
          {/* Modal Header */}
          <View className="border-b border-gray-200 p-6">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowCreateModal(false)}
                className="rounded-full bg-gray-100 p-2">
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>

              <View className="flex-1 items-center">
                <Text className="text-xl font-bold text-gray-900">New Session</Text>
                <Text className="text-sm text-gray-600">Create a new class session</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCreateSession}
                disabled={isLoading}
                className={`rounded-full bg-indigo-500 p-2 ${isLoading ? 'opacity-50' : ''}`}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="checkmark" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Status in Modal */}
          <View className="border-b border-gray-200 p-4">
            <View className="flex-row items-center">
              <View className={`mr-3 rounded-full p-2 ${location ? 'bg-green-100' : 'bg-red-100'}`}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={location ? '#10b981' : '#ef4444'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">
                  {location ? 'Location Ready' : 'Location Required'}
                </Text>
                <Text className="text-xs text-gray-500">
                  {location
                    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                    : locationError || 'Getting location...'}
                </Text>
              </View>
              {(locationError || !location) && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={requestLocationPermission}
                  className="rounded-full bg-blue-100 p-2">
                  <Ionicons name="refresh" size={16} color="#3b82f6" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Course Selection */}
          <View className="max-h-80 p-6">
            <Text className="mb-4 text-lg font-semibold text-gray-900">Select Course</Text>

            <FlatList
              data={courses}
              keyExtractor={(item) => item.courseCode}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: course }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  className={`mb-3 rounded-xl border p-4 ${
                    selectedCourse === course.courseName
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  onPress={() => setSelectedCourse(course.courseName)}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        className={`font-semibold ${
                          selectedCourse === course.courseName ? 'text-indigo-700' : 'text-gray-900'
                        }`}>
                        {course.courseName}
                      </Text>
                      <Text
                        className={`text-sm ${
                          selectedCourse === course.courseName ? 'text-indigo-600' : 'text-gray-500'
                        }`}>
                        {course.courseCode}
                      </Text>
                    </View>
                    {selectedCourse === course.courseName && (
                      <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Modal Footer */}
          <View className="border-t border-gray-200 p-6">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-1 rounded-xl bg-gray-100 py-4"
                onPress={() => setShowCreateModal(false)}>
                <Text className="text-center font-semibold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                className={`flex-1 rounded-xl py-4 ${
                  !selectedCourse.trim() || !location || isLoading ? 'bg-gray-300' : 'bg-indigo-600'
                }`}
                onPress={handleCreateSession}
                disabled={!selectedCourse.trim() || !location || isLoading}>
                <View className="flex-row items-center justify-center">
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="add" size={20} color="white" />
                      <Text className="ml-2 font-semibold text-white">Create Session</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-4">
        <View className="mb-6 rounded-full bg-red-100 p-8">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        </View>
        <Text className="mb-2 text-xl font-bold text-red-600">Something went wrong</Text>
        <Text className="mb-6 text-center text-gray-600">{error}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          className="rounded-xl bg-indigo-600 px-6 py-3 shadow-lg"
          onPress={() => {
            clearError();
            loadData();
          }}>
          <View className="flex-row items-center">
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="ml-2 font-semibold text-white">Try Again</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Enhanced Header matching CoursesScreen */}
      <View className="bg-blue-600 px-4 pb-6 pt-14 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Sessions</Text>
            <Text className="text-sm text-indigo-100">
              {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'}{' '}
              available
            </Text>
          </View>
          <View className="rounded-full bg-white/20 p-3">
            <Ionicons name="school-outline" size={28} color="white" />
          </View>
        </View>

        {/* Enhanced Search Bar */}
        <View className="mt-4 flex-row items-center rounded-2xl bg-white/20 px-4 py-3">
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            className="ml-3 flex-1 text-white placeholder:text-white/70"
            placeholder="Search sessions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading && sessions.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <View className="mb-4 rounded-full bg-indigo-100 p-4">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
          <Text className="text-lg font-medium text-gray-900">Loading sessions...</Text>
          <Text className="text-sm text-gray-600">Please wait while we fetch your sessions</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSessions.slice(0, 20)} // Limit to 20 sessions for performance
          renderItem={renderSessionCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View>
              {renderStatsCard()}
              {role === 'LECTURER' && renderLocationStatus()}
            </View>
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Floating Action Button for Lecturers */}
      {role === 'LECTURER' && (
        <TouchableOpacity
          activeOpacity={0.7}
          className="absolute bottom-6 right-6 rounded-full bg-blue-600 p-4 shadow-lg"
          onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      {renderCreateModal()}
    </View>
  );
};

export default SessionScreen;
