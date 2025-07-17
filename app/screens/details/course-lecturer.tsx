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
import { formatDateTime } from '~/lib/utils';
import { useApiStore } from '~/store/apiStore';
import { useAuthStore } from '~/store/authStore';
import { Course, Session } from '~/types/app';

const CourseDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [courseSessions, setCourseSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const { sessions, fetchSessions } = useApiStore();
  const { user } = useAuthStore();

  const course: Course | undefined =
    typeof params.course === 'string' ? JSON.parse(params.course) : undefined;
  const role = params.role as 'STUDENT' | 'LECTURER' | undefined;

  useEffect(() => {
    if (sessions.length === 0) {
      loadCourseSessions();
    }

    filterCourseSessions();
  }, [sessions]);

  const filterCourseSessions = () => {
    if (!course) return;

    const filteredSessions = sessions
      .filter(
        (session) =>
          session.course?.courseCode === course.courseCode ||
          session.course?.courseName === course.courseName
      )
      .filter((session) => session.lecturer?.email === user?.email);

    const sortedSessions = filteredSessions.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    setCourseSessions(sortedSessions);
  };

  const loadCourseSessions = async () => {
    if (!course || isLoadingSessions) return;

    setIsLoadingSessions(true);
    try {
      await fetchSessions();
    } catch (error) {
      console.error('Error loading course sessions:', error);
      filterCourseSessions();
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const onRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await loadCourseSessions();
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

  const getAttendanceStatus = (session: Session) => {
    // This is mock data - you'll need to implement actual attendance checking
    // based on your backend data structure
    const mockAttendance = Math.random() > 0.3; // 70% attendance rate for demo

    if (session.status === 'ACTIVE') {
      return { status: 'Ongoing', color: 'bg-blue-100 text-blue-600', icon: 'radio-button-on' };
    }

    if (new Date(session.startTime) > new Date()) {
      return { status: 'Upcoming', color: 'bg-gray-100 text-gray-600', icon: 'schedule' };
    }

    return mockAttendance
      ? { status: 'Present', color: 'bg-green-100 text-green-600', icon: 'check-circle' }
      : { status: 'Absent', color: 'bg-red-100 text-red-600', icon: 'cancel' };
  };

  const handleSessionPress = (session: Session) => {
    router.push({
      pathname: '/screens/details/session',
      params: { session: JSON.stringify(session) },
    });
  };

  const renderSessionCard = (session: Session) => {
    const relativeTime = getRelativeTime(session.startTime);
    const attendance = getAttendanceStatus(session);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        key={session.id}
        className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm"
        onPress={() => role === 'LECTURER' && handleSessionPress(session)}>
        <View className="flex-row items-center p-4">
          {/* Status indicator bar */}
          <View
            className={`mr-3 h-12 w-1 rounded-full ${
              attendance.status === 'Present'
                ? 'bg-green-500'
                : attendance.status === 'Absent'
                  ? 'bg-red-500'
                  : attendance.status === 'Ongoing'
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
            }`}
          />

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className={`text-sm font-semibold ${relativeTime.color}`}>
                  {relativeTime.text}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  {formatDateTime(session.startTime).time}
                </Text>
              </View>

              {/* Attendance Status */}
              <View className={`flex-row items-center rounded-full px-3 py-1 ${attendance.color}`}>
                <MaterialIcons name={attendance.icon as any} size={16} />
                <Text className="ml-1 text-xs font-medium">{attendance.status}</Text>
              </View>
            </View>
          </View>

          {role === 'LECTURER' && (
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" className="ml-2" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getSessionStats = () => {
    const totalSessions = courseSessions.length;
    const activeSessions = courseSessions.filter((s) => s.status === 'ACTIVE').length;
    const today = new Date();
    const todaySessions = courseSessions.filter(
      (s) => new Date(s.startTime).toDateString() === today.toDateString()
    ).length;

    return { totalSessions, activeSessions, todaySessions };
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
        {/* Stats Cards */}
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
              <Ionicons name="radio-button-on" size={20} color="#10b981" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{stats.activeSessions}</Text>
            <Text className="text-xs text-gray-500">Active</Text>
          </View>

          <View className="relative flex-1 rounded-xl bg-white p-8 shadow-sm">
            <View className="absolute right-2 top-6 mb-2 self-end rounded-full bg-orange-100 p-2">
              <Ionicons name="today" size={20} color="#f97316" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{stats.todaySessions}</Text>
            <Text className="text-xs text-gray-500">Today</Text>
          </View>
        </View>

        <View className="px-6 pb-6">
          {/* Sessions Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-900">Session History</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => !isLoadingSessions && loadCourseSessions()}
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
          {courseSessions.length > 0 ? (
            <View>
              {courseSessions.map(renderSessionCard)}
              {isLoadingSessions && (
                <View className="mt-4 items-center py-4">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="mt-2 text-sm text-gray-500">Updating sessions...</Text>
                </View>
              )}
            </View>
          ) : isLoadingSessions ? (
            <View className="flex-1 items-center justify-center py-12">
              <View className="mb-4 rounded-full bg-blue-100 p-4">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
              <Text className="text-gray-500">Loading sessions...</Text>
            </View>
          ) : (
            <View className="items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
              <View className="mb-4 rounded-full bg-gray-100 p-6">
                <Ionicons name="calendar-outline" size={48} color="#6B7280" />
              </View>
              <Text className="text-lg font-semibold text-gray-900">No Sessions Yet</Text>
              <Text className="mt-2 px-8 text-center text-sm text-gray-500">
                No sessions have been created for this course
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CourseDetails;
