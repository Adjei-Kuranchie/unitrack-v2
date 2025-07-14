/**
 * CourseDetails component displays detailed information about a specific course,
 * including its sessions and session statistics. It allows users to refresh session data,
 * view session details, and navigate back to the previous screen.
 *
 * Features:
 * - Fetches and filters sessions related to the selected course.
 * - Displays course information, session statistics, and a list of sessions.
 * - Allows pull-to-refresh and manual refresh of session data.
 * - Shows session status and time, and navigates to session details for lecturers.
 * - Handles loading and error states gracefully.
 *
 * Usage:
 * This component is intended to be used within a navigation stack where course details
 * are passed via route parameters.
 *
 * Dependencies:
 * - React Native components for UI rendering.
 * - Expo Router for navigation.
 * - Tailwind CSS classes for styling.
 * - Custom hooks and utilities for API and date formatting.
 *
 * @component
 * @example
 * <CourseDetails />
 */

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
import { Attendance, Course, Session } from '~/types/app';

const CourseDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [courseSessions, setCourseSessions] = useState<Attendance[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const { sessions, fetchSessions, attendance } = useApiStore();
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
    const filteredAttendance = attendance.filter(
      (record) => record.courseName === course.courseName
    );

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

    setCourseSessions(filteredAttendance);
  };

  const loadCourseSessions = async () => {
    if (!course || isLoadingSessions) return;

    setIsLoadingSessions(true);
    try {
      // Only fetch if we don't have sessions or user explicitly refreshes
      await fetchSessions();
    } catch (error) {
      console.error('Error loading course sessions:', error);
      // Even if fetch fails, try to filter existing sessions
      filterCourseSessions();
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const onRefresh = async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes

    setRefreshing(true);
    try {
      await loadCourseSessions();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-700 bg-green-100';
      case 'CLOSED':
        return 'text-gray-700 bg-red-100';
      default:
        return 'text-blue-700 bg-blue-100';
    }
  };

  const handleSessionPress = (session: Session) => {
    // Navigate to session details
    router.push({
      pathname: '/screens/details/session',
      params: { session: JSON.stringify(session) },
    });
  };

  const renderSessionCard = (session: Session) => {
    const startTime = new Date(session.startTime);
    const isToday = startTime.toDateString() === new Date().toDateString();
    //TODO: Modify the renderSessionCard to show the session time(like yesterday, today, last 5 days, shows the date when it's been more than a week) and the session status whether absent or present for that session, no session number

    //TODO: or change the whole courses.tsx UI to show the students courses in a grid view with the course name, code, and lecturer name, and then on click it shows the sessions for that course in a bottom sheet list view with the session time and status whether absent or present for that session

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        key={session.id}
        className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        onPress={() => role == 'LECTURER' && handleSessionPress(session)}>
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-lg font-semibold text-gray-800">Session #{session.id}</Text>
              {isToday && (
                <View className="ml-2 rounded-full bg-orange-100 px-2 py-1">
                  <Text className="text-xs font-medium text-orange-700">Today</Text>
                </View>
              )}
            </View>
            <Text className="mt-1 text-sm text-gray-500">
              {formatDateTime(session.startTime).date} {formatDateTime(session.startTime).time}
            </Text>
          </View>

          <View className="items-end">
            <View className={`rounded-full px-3 py-1 ${getSessionStatusColor(session.status)}`}>
              <Text className="text-xs font-medium capitalize">{session.status.toLowerCase()}</Text>
            </View>
            {session.lecturer && (
              <Text className="mt-1 text-xs text-gray-500">
                {session.lecturer.firstName} {session.lecturer.lastName}
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-500">
              Location: {session.location.latitude.toFixed(4)},{' '}
              {session.location.longitude.toFixed(4)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecordCard = (record: Attendance, i: number) => {
    // const startTime = new Date(session.startTime);
    // const isToday = startTime.toDateString() === new Date().toDateString();
    //TODO: Modify the renderRecordCard to show the session time(like yesterday, today, last 5 days, shows the date when it's been more than a week) and the session status whether absent or present for that session, no session number

    //TODO: or change the whole courses.tsx UI to show the students courses in a grid view with the course name, code, and lecturer name, and then on click it shows the sessions for that course in a bottom sheet list view with the session time and status whether absent or present for that session

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        key={String(i)}
        className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-lg font-semibold text-gray-800">Record #{i}</Text>
              {/* {isToday && (
                <View className="ml-2 rounded-full bg-orange-100 px-2 py-1">
                  <Text className="text-xs font-medium text-orange-700">Today</Text>
                </View>
              )} */}
            </View>
            <Text className="mt-1 text-sm text-gray-500">
              {formatDateTime(record.date).date} {formatDateTime(record.date).time}
            </Text>
          </View>

          <View className="items-end">
            {/* <View className={`rounded-full px-3 py-1 ${getRecordStatusColor(record.status)}`}>
              <Text className="text-xs font-medium capitalize">{record.status.toLowerCase()}</Text>
            </View> */}
            {record.lecturer && (
              <Text className="mt-1 text-xs text-gray-500">{record.lecturer}</Text>
            )}
          </View>
        </View>

        {/* <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-500">
              Location: {record.location.latitude.toFixed(4)},{' '}
              {record.location.longitude.toFixed(4)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </View> */}
      </TouchableOpacity>
    );
  };

  const getSessionStats = () => {
    const totalSessions = courseSessions.length;
    // const activeSessions = courseSessions.filter((s) => s.status === 'ACTIVE').length;
    const today = new Date();
    const todaySessions = courseSessions.filter(
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
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">{stats.totalSessions}</Text>
              <Text className="text-sm text-gray-500">Total Sessions</Text>
            </View>
            {/* <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">{stats.activeSessions}</Text>
              <Text className="text-sm text-gray-500">Active</Text>
            </View> */}
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
            onPress={() => !isLoadingSessions && loadCourseSessions()}
            disabled={isLoadingSessions}>
            {isLoadingSessions ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Ionicons name="refresh" size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        {/* Show immediate filtered results while loading */}
        {courseSessions.length > 0 ? (
          <View>
            {courseSessions.map((courseSession, i) => renderRecordCard(courseSession, i))}
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
