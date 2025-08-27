import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
import { getAttendanceStatusDisplay, getStudentAttendanceStats } from '~/lib/attendanceUtils'; // Import your new functions
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

  const { sessions, fetchSessions } = useApiStore();
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

    const allAttendance = sessions.map((session) => session.attendance);

    const filteredAttendance = allAttendance.filter(
      (record) => record.courseName === course.courseName
    );
    // Sort by date, newest first
    const sortedAttendance = filteredAttendance.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setRecordSessions(sortedAttendance);
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

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return { text: 'Today', color: 'text-green-600' };
    }

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return { text: 'Yesterday', color: 'text-blue-600' };
    }

    // Check if within last 5 days
    if (diffDays <= 5 && date < now) {
      return { text: `${diffDays} days ago`, color: 'text-gray-600' };
    }

    // Otherwise show date
    return {
      text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      color: 'text-gray-600',
    };
  };

  const renderRecordCard = (record: Attendance, index: number) => {
    const relativeTime = getRelativeTime(record.date);
    const recordNumber = recordSessions.length - index; // Reverse numbering so newest is highest

    // Get attendance status for current user
    const attendanceStatus = user ? getAttendanceStatusDisplay(record, user) : null;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        key={index}
        className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
        <View className="flex-row items-center p-4">
          {/* Status indicator bar - color based on attendance */}
          <View
            className={`mr-3 h-12 w-1 rounded-full ${attendanceStatus?.statusBarColor || 'bg-gray-300'}`}
          />

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-lg font-semibold text-gray-800">
                    Record #{recordNumber}
                  </Text>
                  <Text className={`ml-2 text-sm font-semibold ${relativeTime.color}`}>
                    • {relativeTime.text}
                  </Text>
                </View>
                <Text className="mt-1 text-xs text-gray-500">
                  {formatDateTime(record.date).time}
                </Text>
              </View>

              {/* Attendance Status Badge */}
              {attendanceStatus && (
                <View
                  className={`flex-row items-center rounded-full px-3 py-1 ${attendanceStatus.badgeColor}`}>
                  <MaterialIcons
                    name={attendanceStatus.iconName as any}
                    size={16}
                    color={attendanceStatus.iconColor}
                  />
                  <Text className={`ml-1 text-xs font-medium ${attendanceStatus.textColor}`}>
                    {attendanceStatus.statusText}
                  </Text>
                </View>
              )}
            </View>

            {/* Lecturer info if available */}
            {record.lecturer && (
              <Text className="mt-2 text-xs text-gray-500">Lecturer: {record.lecturer}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getSessionStats = () => {
    if (!user)
      return { totalSessions: 0, attendedSessions: 0, missedSessions: 0, attendanceRate: 0 };

    // Use the new attendance stats function
    const stats = getStudentAttendanceStats(recordSessions, user);
    return {
      totalSessions: stats.totalSessions,
      attendedSessions: stats.attendedSessions,
      missedSessions: stats.missedSessions,
      attendanceRate: stats.attendanceRate,
    };
  };

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <View className="mb-6 rounded-full bg-red-100 p-8">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        </View>
        <Text className="mb-2 text-xl font-bold text-gray-900">No Course Found</Text>
        <Text className="mb-6 text-center text-gray-600">Course details could not be loaded.</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="rounded-xl bg-gray-900 px-6 py-3">
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = getSessionStats();

  return (
    <View className="flex-1 bg-slate-50">
      {/* Enhanced Header */}
      <View className="mb-6 bg-blue-600 px-6 pb-6 pt-12">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="mb-4 flex-row items-center">
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="ml-2 text-base font-medium text-white">Back</Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <View className="mr-4 rounded-full bg-white/20 p-3">
            <Ionicons name="book" size={28} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">{course.courseName}</Text>
            <Text className="mt-1 font-mono text-base text-blue-100">{course.courseCode}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {/* Updated Stats Cards */}
        <View className="mx-6 -mt-4 mb-6 flex-row gap-3">
          <View className="relative flex-1 rounded-xl bg-white p-4 py-8 shadow-sm">
            <View className="absolute right-2 top-6 mb-2 self-end rounded-full bg-blue-100 p-2">
              <Ionicons name="calendar" size={20} color="#3b82f6" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{stats.totalSessions}</Text>
            <Text className="text-xs text-gray-500">Total Sessions</Text>
          </View>

          <View className="relative flex-1 rounded-xl bg-white p-8 shadow-sm">
            <View className="absolute right-2 top-6 mb-2 self-end rounded-full bg-green-100 p-2">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{stats.attendedSessions}</Text>
            <Text className="text-xs text-gray-500">Attended</Text>
          </View>

          <View className="relative flex-1 rounded-xl bg-white p-8 shadow-sm">
            <View className="absolute right-2 top-6 mb-2 self-end rounded-full bg-red-100 p-2">
              <Ionicons name="close-circle" size={20} color="#ef4444" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{stats.missedSessions}</Text>
            <Text className="text-xs text-gray-500">Missed</Text>
          </View>
        </View>

        {/* Attendance Rate Card */}
        <View className="mx-6 mb-6 rounded-xl bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold text-gray-900">Attendance Rate</Text>
              <Text className="text-xs text-gray-500">Your overall attendance percentage</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</Text>
              <View
                className={`mt-1 rounded-full px-2 py-1 ${stats.attendanceRate >= 75 ? 'bg-green-100' : stats.attendanceRate >= 50 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <Text
                  className={`text-xs font-medium ${stats.attendanceRate >= 75 ? 'text-green-600' : stats.attendanceRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {stats.attendanceRate >= 75
                    ? 'Good'
                    : stats.attendanceRate >= 50
                      ? 'Fair'
                      : 'Poor'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 pb-6">
          {/* Sessions Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-900">Your Attendance Records</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => !isLoadingSessions && loadRecordSessions()}
              disabled={isLoadingSessions}
              className="rounded-full bg-gray-100 p-2">
              {isLoadingSessions ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <Ionicons name="refresh" size={16} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>

          {/* Sessions List */}
          {recordSessions.length > 0 ? (
            <View>
              {recordSessions.map((record, i) => renderRecordCard(record, i))}
              {isLoadingSessions && (
                <View className="mt-4 items-center py-4">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="mt-2 text-sm text-gray-500">Updating records...</Text>
                </View>
              )}
            </View>
          ) : isLoadingSessions ? (
            <View className="flex-1 items-center justify-center py-12">
              <View className="mb-4 rounded-full bg-blue-100 p-4">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
              <Text className="text-gray-500">Loading attendance records...</Text>
            </View>
          ) : (
            <View className="items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
              <View className="mb-4 rounded-full bg-gray-100 p-6">
                <Ionicons name="calendar-outline" size={48} color="#6B7280" />
              </View>
              <Text className="text-lg font-semibold text-gray-900">No Attendance Records</Text>
              <Text className="mt-2 px-8 text-center text-sm text-gray-500">
                No sessions have been recorded for this course yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CourseDetails;
