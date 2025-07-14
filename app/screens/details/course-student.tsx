import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatDateTime } from '~/lib/utils';
import { useApiStore } from '~/store/apiStore';
import { useAuthStore } from '~/store/authStore';
import { Attendance, Course } from '~/types/app';

const CourseDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [recordSessions, setRecordSessions] = useState<Attendance[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const { sessions, fetchSessions, attendance } = useApiStore();
  const { user } = useAuthStore();

  const course: Course | undefined =
    typeof params.course === 'string' ? JSON.parse(params.course) : undefined;

  useEffect(() => {
    if (sessions.length === 0) {
      loadRecordSessions();
    }

    filterRecordSessions();
  }, [sessions]);

  const filterRecordSessions = () => {
    if (!course) return;
    const filteredAttendance = attendance.filter(
      (record) => record.courseName === course.courseName
    );

    setRecordSessions(filteredAttendance);
  };

  const loadRecordSessions = async () => {
    if (!course || isLoadingSessions) return;

    setIsLoadingSessions(true);
    try {
      // Only fetch if we don't have sessions or user explicitly refreshes
      await fetchSessions();
    } catch (error) {
      console.error('Error loading course sessions:', error);
      // Even if fetch fails, try to filter existing sessions
      filterRecordSessions();
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const onRefresh = async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes

    setRefreshing(true);
    try {
      await loadRecordSessions();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderRecordCard = (record: Attendance, i: number) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        key={String(++i)}
        className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-lg font-semibold text-gray-800">Record #{i}</Text>
            </View>
            <Text className="mt-1 text-sm text-gray-500">
              {formatDateTime(record.date).date} {formatDateTime(record.date).time}
            </Text>
          </View>

          <View className="items-end">
            {record.lecturer && (
              <Text className="mt-1 text-xs text-gray-500">{record.lecturer}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getSessionStats = () => {
    const totalSessions = recordSessions.length;
    const today = new Date();
    const todaySessions = recordSessions.filter(
      (s) => new Date(s.date).toDateString() === today.toDateString()
    ).length;

    return { totalSessions, todaySessions };
  };

  if (!course) {
    return (
      <View className="flex-1 bg-gray-50 px-6 py-8">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="mb-6 flex-row items-center">
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text className="ml-2 text-lg font-medium text-gray-700">Back</Text>
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center">
          <View className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text className="mt-4 text-center text-xl font-semibold text-gray-800">
              No Course Found
            </Text>
            <Text className="mt-2 text-center text-gray-600">
              Course details could not be loaded.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const stats = getSessionStats();

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}>
      <View className="px-6 py-8">
        {/* Header with Back Button */}
        <View className="mb-6 flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="flex-row items-center rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <Ionicons name="arrow-back" size={20} color="#374151" />
            <Text className="ml-2 text-base font-medium text-gray-700">Back</Text>
          </TouchableOpacity>
        </View>

        {/* Course Header Card */}
        <View className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <View className="mr-4 rounded-full bg-blue-500 p-3">
              <Ionicons name="book" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">{course.courseName}</Text>
              <Text className="mt-1 font-mono text-lg font-semibold text-blue-600">
                {course.courseCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Session Stats Card */}
        <View className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-800">Session Statistics</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">{stats.totalSessions}</Text>
              <Text className="text-sm text-gray-500">Total Sessions</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">{stats.todaySessions}</Text>
              <Text className="text-sm text-gray-500">Today</Text>
            </View>
          </View>
        </View>

        {/* Sessions List */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-800">Your Sessions</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => !isLoadingSessions && loadRecordSessions()}
            disabled={isLoadingSessions}>
            {isLoadingSessions ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Ionicons name="refresh" size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        {/* Show immediate filtered results while loading */}
        {recordSessions.length > 0 ? (
          <View>
            {recordSessions.map((courseSession, i) => renderRecordCard(courseSession, i))}
            {isLoadingSessions && (
              <View className="mt-4 items-center py-4">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="mt-2 text-sm text-gray-500">Updating sessions...</Text>
              </View>
            )}
          </View>
        ) : isLoadingSessions ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-2 text-gray-500">Loading sessions...</Text>
          </View>
        ) : (
          <View className="items-center justify-center rounded-2xl border border-gray-100 bg-white py-12 shadow-sm">
            <Ionicons name="calendar-outline" size={48} color="#6B7280" />
            <Text className="mt-4 text-lg font-medium text-gray-600">No Sessions Yet</Text>
            <Text className="mt-2 px-8 text-center text-gray-500">
              No sessions have been created for this course
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CourseDetails;
