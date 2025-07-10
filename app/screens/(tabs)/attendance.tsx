/**
 * AttendanceScreen component for managing and displaying class attendance.
 *
 * - Allows students to mark their attendance for active sessions using their current location.
 * - Displays attendance history for the logged-in user.
 * - Handles location permissions and errors.
 * - Supports pull-to-refresh and manual refresh of attendance data.
 * - Shows error messages and loading states.
 *
 * Features:
 * - Session picker for students to select an active session.
 * - Location status display and retry option if location access fails.
 * - Button to mark attendance, disabled if prerequisites are not met.
 * - Attendance history list with date, time, lecturer, and status.
 * - Error handling and user feedback via alerts and banners.
 *
 * Uses:
 * - `useApiStore` for fetching sessions, attendance, and marking attendance.
 * - `useAuthStore` for user authentication and role.
 * - Expo Location API for geolocation.
 * - React Native components and styling.
 *
 * @component
 * @returns {JSX.Element} The rendered AttendanceScreen component.
 */

import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useApiStore } from '~/store/apiStore';
import { useAuthStore } from '~/store/authStore';
import { Attendance } from '~/types/app';

const AttendanceScreen = () => {
  const {
    sessions,
    attendance,
    isLoading,
    error,
    fetchSessions,
    fetchAttendance,
    markAttendance,
    clearError,
  } = useApiStore();

  const { role, user } = useAuthStore();

  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const IndexNumber = user?.IndexNumber;
  const filteredSessions = sessions.filter((session) => session.status === 'ACTIVE');

  useEffect(() => {
    Promise.all([loadInitialData(), requestLocationPermission()]);
  }, []);

  const loadInitialData = async () => {
    await fetchSessions();
    await fetchAttendance();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
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

  const handleMarkAttendance = async () => {
    if (!selectedSession) {
      Alert.alert('Error', 'Please select a session');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location is required to mark attendance');
      return;
    }

    setMarking(true);

    /* TODO: Instead of get device Id(which we cannot retrieve from ios devices without asking for a permit), let's create our own id using uuid on the server 
    so basically, on account creation, you run the createUuid function to create a UUid that ties to the account,
    then you send back the uuid with all the info when they login into their account on the phone, where I set it to the app's storage 
    Then on every mark attendance, i send back the id and you check if it is the same as the one on the server 
    if it is then you mark it 
    and also what is the ID for? 
    they should not be passed through params, only through request body
     */

    try {
      await markAttendance({ sessionId: selectedSession, location, studentId: IndexNumber });

      Alert.alert('Success', 'Attendance marked successfully!');
      await fetchAttendance(); // Refresh attendance records
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  const renderAttendanceRecord = (record: Attendance, index: number) => {
    // Ensure we have valid string/number values for display
    const recordId = String(index);
    const lecturer = String(record.lecturer);
    const studentId = IndexNumber ? String(IndexNumber) : null;
    const date = record.date;
    const time = record.time;

    return (
      <View
        key={recordId} // Fixed: Use string key instead of potentially undefined object
        className="border-b border-gray-100 py-4 last:border-b-0">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="calendar" size={16} color="#6b7280" />
            <Text className="ml-2 text-sm text-gray-600">{date}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time" size={16} color="#6b7280" />
            <Text className="ml-2 text-sm text-gray-600">{time}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="school" size={16} color="#6b7280" />
            <Text className="ml-2 text-sm capitalize text-gray-700">{lecturer}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text className="ml-2 text-sm font-medium text-green-600">Present</Text>
          </View>
        </View>

        {studentId && (
          <View className="mt-2 flex-row items-center">
            <Ionicons name="person" size={16} color="#6b7280" />
            <Text className="ml-2 text-xs text-gray-500">Student ID: {studentId}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}
        <View className="mb-4 rounded-lg bg-white p-6 shadow-sm">
          <Text className="mb-2 text-2xl font-bold text-gray-800">Attendance Management</Text>
          <Text className="text-gray-600">Track and manage your class attendance</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-red-700">{error}</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={clearError}>
                <Ionicons name="close" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Mark Attendance Section - Only for Students */}
        {role === 'STUDENT' && (
          <View className="mb-4 rounded-lg bg-white p-6 shadow-sm">
            <Text className="mb-4 text-xl font-semibold text-gray-800">Mark Attendance</Text>

            {/* Session Picker */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">Select Session</Text>
              <View className="rounded-md border border-gray-300 bg-white">
                <Picker
                  selectedValue={selectedSession}
                  onValueChange={(itemValue) => setSelectedSession(itemValue)}
                  enabled={!marking}>
                  <Picker.Item label="Select a session" value={null} />
                  {filteredSessions.map((session) => (
                    <Picker.Item
                      key={session.id}
                      label={`${session.course.courseCode}: ${session.course.courseName}`}
                      value={session.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Location Status */}
            <View className="mb-4">
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
                    activeOpacity={0.7}
                    onPress={requestLocationPermission}
                    className="ml-2 rounded-full bg-blue-100 p-1">
                    <Ionicons name="refresh" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                )}
              </View>

              {locationError && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={requestLocationPermission}
                  className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2">
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="location" size={16} color="#3b82f6" />
                    <Text className="ml-2 font-medium text-blue-600">Retry Location Access</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Mark Attendance Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleMarkAttendance}
              disabled={marking || !location || !selectedSession}
              className={`flex-row items-center justify-center rounded-md px-4 py-3 ${
                marking || !location || !selectedSession ? 'bg-gray-400' : 'bg-blue-600'
              }`}>
              <Ionicons name={marking ? 'hourglass' : 'checkmark-circle'} size={20} color="white" />
              <Text className="ml-2 font-medium text-white">
                {marking ? 'Marking Attendance...' : 'Mark Attendance'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Attendance Records */}
        <View className="rounded-lg bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-gray-800">Attendance History</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={loadInitialData}
              disabled={isLoading}
              className="flex-row items-center rounded-md bg-gray-100 px-3 py-2">
              <Ionicons name="refresh" size={16} color="#374151" />
              <Text className="ml-2 text-sm text-gray-700">Refresh</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="flex-row items-center justify-center py-8">
              <Ionicons name="hourglass" size={24} color="#3b82f6" />
              <Text className="ml-2 text-gray-600">Loading attendance records...</Text>
            </View>
          ) : Array.isArray(attendance) && attendance.length > 0 ? (
            <View>{attendance.map((record, index) => renderAttendanceRecord(record, index))}</View>
          ) : (
            <View className="items-center py-8">
              <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
              <Text className="mt-2 text-gray-500">No attendance records found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AttendanceScreen;
