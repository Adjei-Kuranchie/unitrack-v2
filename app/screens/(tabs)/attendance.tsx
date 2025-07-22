import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { formatDateTime } from '~/lib/utils';
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

    // Check for new sessions after 5 seconds
    const timer = setTimeout(() => {
      fetchSessions();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const loadInitialData = async () => {
    await fetchSessions();
    await fetchAttendance();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    await requestLocationPermission();
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

    try {
      const success = await markAttendance({ sessionId: selectedSession, location });
      if (success) {
        Alert.alert('Success', 'Attendance marked successfully!');
        await fetchAttendance();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance.\n Try again!');
    } finally {
      setMarking(false);
    }
  };

  const renderAttendanceRecord = (record: Attendance, index: number) => {
    const recordId = String(index);
    const lecturer = String(record.lecturer);
    const studentId = IndexNumber ? String(IndexNumber) : null;
    const { date } = formatDateTime(record.date);
    const { time } = formatDateTime(record.date);

    return (
      <View
        key={recordId}
        className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        {/* Header with date and status */}
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-3 rounded-full bg-blue-50 p-2">
              <Ionicons name="calendar" size={16} color="#3b82f6" />
            </View>
            <View>
              <Text className="text-sm font-semibold text-gray-800">{date}</Text>
              <Text className="text-xs text-gray-500">{time}</Text>
            </View>
          </View>
          <View className="rounded-full bg-green-100 px-3 py-1">
            <View className="flex-row items-center">
              <View className="mr-1 h-2 w-2 rounded-full bg-green-500"></View>
              <Text className="text-xs font-medium text-green-700">Present</Text>
            </View>
          </View>
        </View>

        {/* Course and lecturer info */}
        <View className="mb-2 flex-row items-center">
          <View className="mr-3 rounded-full bg-purple-50 p-2">
            <Ionicons name="school" size={16} color="#8b5cf6" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium capitalize text-gray-800">{lecturer}</Text>
            <Text className="text-xs text-gray-500">Lecturer</Text>
          </View>
        </View>

        {/* Student ID */}
        {studentId && (
          <View className="mt-2 flex-row items-center border-t border-gray-50 pt-2">
            <View className="mr-3 rounded-full bg-gray-50 p-2">
              <Ionicons name="person" size={14} color="#6b7280" />
            </View>
            <Text className="text-xs text-gray-500">Student ID: {studentId}</Text>
          </View>
        )}
      </View>
    );
  };

  const LocationStatusCard = () => (
    <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-800">Location Status</Text>
        {(locationError || !location) && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={requestLocationPermission}
            className="rounded-full bg-blue-500 p-2">
            <Ionicons name="refresh" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View className={`rounded-xl p-4 ${location ? 'bg-green-50' : 'bg-red-50'}`}>
        <View className="flex-row items-center">
          <View className={`mr-3 rounded-full p-2 ${location ? 'bg-green-100' : 'bg-red-100'}`}>
            <Ionicons name="location" size={20} color={location ? '#10b981' : '#ef4444'} />
          </View>
          <View className="flex-1">
            {location ? (
              <View>
                <Text className="text-sm font-medium text-green-800">Location Found</Text>
                <Text className="text-xs text-green-600">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-sm font-medium text-red-800">
                  {locationError || 'Getting location...'}
                </Text>
                <Text className="text-xs text-red-600">
                  Location is required to mark attendance
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {locationError && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={requestLocationPermission}
          className="mt-3 rounded-xl bg-blue-500 p-3">
          <View className="flex-row items-center justify-center">
            <Ionicons name="location" size={16} color="white" />
            <Text className="ml-2 font-medium text-white">Enable Location Access</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-blue-600 px-4 pb-6 pt-14 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Attendance</Text>
            <Text className="text-sm text-blue-100">
              {Array.isArray(attendance) ? attendance.length : 0} records available
            </Text>
          </View>
          <View className="rounded-full bg-white/20 p-3">
            <Ionicons name="checkmark-circle" size={28} color="white" />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Error Message */}
        {error && (
          <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                <View className="mr-3 rounded-full bg-red-100 p-2">
                  <Ionicons name="warning" size={16} color="#dc2626" />
                </View>
                <Text className="flex-1 text-red-700">{error}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={clearError}>
                <Ionicons name="close" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Mark Attendance Section - Only for Students */}
        {role === 'STUDENT' && (
          <View className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 rounded-full bg-green-100 p-2">
                <Ionicons name="add-circle" size={20} color="#10b981" />
              </View>
              <Text className="text-xl font-semibold text-gray-800">Mark Attendance</Text>
            </View>

            {/* Session Picker */}
            <View className="mb-4">
              <Text className="mb-3 text-sm font-medium text-gray-700">Select Session</Text>
              <View className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <Picker
                  selectedValue={selectedSession}
                  onValueChange={(itemValue) => setSelectedSession(itemValue)}
                  enabled={!marking}>
                  <Picker.Item label="Choose an active session" value={null} />
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
            <LocationStatusCard />

            {/* Mark Attendance Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleMarkAttendance}
              disabled={marking || !location || !selectedSession}
              className={`flex-row items-center justify-center rounded-xl px-6 py-4 shadow-lg ${
                marking || !location || !selectedSession
                  ? 'bg-gray-300 shadow-none'
                  : 'bg-green-600 shadow-green-200'
              }`}>
              <View className="mr-3 rounded-full bg-white/20 p-1">
                <Ionicons
                  name={marking ? 'hourglass' : 'checkmark-circle'}
                  size={20}
                  color="white"
                />
              </View>
              <Text className="text-lg font-semibold text-white">
                {marking ? 'Marking...' : 'Mark Attendance'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Attendance Records */}
        <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-3 rounded-full bg-indigo-100 p-2">
                <Ionicons name="time" size={20} color="#6366f1" />
              </View>
              <Text className="text-xl font-semibold text-gray-800">Attendance History</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={loadInitialData}
              disabled={isLoading}
              className="rounded-full bg-gray-100 p-3">
              <Ionicons name="refresh" size={16} color="#374151" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="items-center py-12">
              <View className="mb-3 rounded-full bg-blue-100 p-4">
                <Ionicons name="hourglass" size={32} color="#3b82f6" />
              </View>
              <Text className="text-gray-600">Loading attendance records...</Text>
            </View>
          ) : Array.isArray(attendance) && attendance.length > 0 ? (
            <View className="mt-4">
              {attendance
                .slice(0, 11)
                .map((record, index) => renderAttendanceRecord(record, index))}
            </View>
          ) : (
            <View className="items-center py-12">
              <View className="mb-3 rounded-full bg-gray-100 p-4">
                <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
              </View>
              <Text className="text-lg font-medium text-gray-600">No records found</Text>
              <Text className="mt-1 text-sm text-gray-500">
                Your attendance history will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AttendanceScreen;
