/**
 * Displays detailed information about a specific session, including course details,
 * session status, schedule, location, lecturer, and attendance summary.
 *
 * This screen expects a `session` parameter from the local search params, which should be
 * a JSON string representing the session data. The session data is parsed and used to
 * populate the UI with relevant information.
 *
 * Features:
 * - Header with navigation back button and session ID.
 * - Course information (code and name).
 * - Session status with color-coded badge.
 * - Schedule section showing start and end times.
 * - Location details with coordinates (if available).
 * - Lecturer information (if available).
 * - Attendance summary showing number of students present (if available).
 *
 * Utilizes:
 * - `expo-router` for navigation and parameter handling.
 * - `react-native-safe-area-context` for safe area insets.
 * - `@expo/vector-icons` for icons.
 * - Utility function `formatDateTime` for formatting date and time.
 *
 * @component
 * @returns {JSX.Element} The rendered session details screen.
 */

import { Ionicons } from '@expo/vector-icons';
import { BottomSheetFlatList, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useRef } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomBottomSheetModal from '~/components/CustomBottomSheetModal';
import { formatDateForFilename, formatDateTime } from '~/lib/utils';
import { useApiStore } from '~/store/apiStore';
import { Session } from '~/types/app';

const SessionScreen = () => {
  const { session } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading } = useApiStore();
  const sessionData: Session = JSON.parse(session as string);
  const startDateTime = formatDateTime(sessionData.startTime);
  const endDateTime = formatDateTime(sessionData.endTime);

  //export functionality
  const exportModalRef = useRef<BottomSheetModal>(null);
  const exportCSV = async () => {
    try {
      // Check if there are students to export
      if (!sessionData.attendance.studentList || sessionData.attendance.studentList.length === 0) {
        alert('No students to export');
        return;
      }

      // Create CSV headers
      const headers = [
        'Student ID',
        'Username',
        'Email',
        'Course Code',
        'Course Name',
        'Session Date',
        'Session Time',
      ];

      // Create CSV rows
      const rows = sessionData.attendance.studentList.map((student) => [
        student.IndexNumber || student.username, // Use IndexNumber if available, fallback to username
        student.username,
        student.email,
        sessionData.course.courseCode,
        sessionData.course.courseName,
        startDateTime.date,
        startDateTime.time,
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map((row) => row.map((field) => `"${field}"`).join(','))
        .join('\n');

      // Create filename with course code and date
      const dateForFilename = formatDateForFilename(sessionData.startTime);
      const filename = `attendance_${sessionData.course.courseCode}_${dateForFilename}.csv`;

      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Attendance Records',
        UTI: 'public.comma-separated-values-text',
      });

      exportModalRef.current?.dismiss();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="-ml-2 rounded-full p-2">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Session Details</Text>
        <View className="rounded-full bg-blue-100 px-3 py-1">
          <Text className="text-sm font-semibold text-blue-800">#{sessionData.id}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Content */}
        <View className="space-y-4 p-4">
          {/* Course Header */}
          <View className="rounded-2xl bg-blue-600 p-6 shadow-lg">
            <View className="items-center">
              <Text className="mb-2 text-sm font-medium text-white opacity-90">COURSE</Text>
              <Text className="mb-2 text-center text-3xl font-bold text-white">
                {sessionData.course?.courseCode}
              </Text>
              <Text className="text-center text-lg leading-6 text-white opacity-95">
                {sessionData.course?.courseName}
              </Text>
            </View>
          </View>

          {/* Status */}
          <View className="rounded-xl bg-white p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-500">Status</Text>
              <View className={`rounded-full px-3 py-1 ${getStatusColor(sessionData.status)}`}>
                <Text className="text-sm font-medium">{sessionData.status}</Text>
              </View>
            </View>
          </View>

          {/* Time Information */}
          <View className="rounded-xl bg-white p-4 shadow-sm">
            <Text className="mb-3 text-sm text-gray-500">Schedule</Text>
            <View className="space-y-4">
              {/* Start Time */}
              <View className="flex-row items-center">
                <View className="mr-3 h-3 w-3 rounded-full bg-green-500" />
                <View className="flex-1">
                  <Text className="text-sm text-gray-500">Start Time</Text>
                  <Text className="text-base font-medium text-gray-900">{startDateTime.date}</Text>
                  <Text className="text-lg font-semibold text-green-600">{startDateTime.time}</Text>
                </View>
              </View>

              {/* Divider */}
              <View className="ml-6 h-4 border-l-2 border-gray-200" />

              {/* End Time */}
              <View className="flex-row items-center">
                <View className="mr-3 h-3 w-3 rounded-full bg-red-500" />
                <View className="flex-1">
                  <Text className="text-sm text-gray-500">End Time</Text>
                  <Text className="text-base font-medium text-gray-900">{endDateTime.date}</Text>
                  <Text className="text-lg font-semibold text-red-600">{endDateTime.time}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Location */}
          {sessionData.location && (
            <View className="rounded-xl bg-white p-4 shadow-sm">
              <Text className="mb-3 text-sm text-gray-500">Location</Text>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="#6B7280" />
                <View className="ml-2 flex-1">
                  <Text className="text-sm text-gray-500">Coordinates</Text>
                  <Text className="text-base font-medium text-gray-900">
                    {sessionData.location.latitude.toFixed(6)},{' '}
                    {sessionData.location.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Lecturer Information */}
          {sessionData.lecturer && (
            <View className="rounded-xl bg-white p-4 shadow-sm">
              <Text className="mb-3 text-sm text-gray-500">Lecturer</Text>
              <View className="space-y-2">
                <Text className="text-lg font-semibold text-gray-900">
                  {sessionData.lecturer.firstName} {sessionData.lecturer.lastName}
                </Text>
                <Text className="text-sm text-gray-600">{sessionData.lecturer.email}</Text>
                {sessionData.lecturer.department.id && (
                  <Text className="text-sm text-gray-500">
                    {sessionData.lecturer.department.departmentName}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Attendance Summary */}
          {sessionData.attendance && (
            <View className="rounded-xl bg-white p-6 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-gray-900">Attendance Summary</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => exportModalRef.current?.present()}
                  className="flex-row items-center rounded-lg bg-blue-50 px-3 py-2">
                  <Ionicons name="download-outline" size={16} color="#2563eb" />
                  <Text className="ml-1 text-sm font-medium text-blue-600">Export</Text>
                </TouchableOpacity>
              </View>

              {/* Stats Overview */}
              <View className="mb-4 flex-row items-center justify-between rounded-lg bg-gray-50 p-4">
                <View className="flex-row items-center">
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Ionicons name="people" size={24} color="#2563eb" />
                  </View>
                  <View>
                    <Text className="text-sm text-gray-500">Total Present</Text>
                    <Text className="text-2xl font-bold text-gray-900">
                      {sessionData.attendance.studentList?.length || 0}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-gray-500">Session Date</Text>
                  <Text className="text-sm font-medium text-gray-900">{startDateTime.date}</Text>
                </View>
              </View>

              {/* Students Preview */}
              {sessionData.attendance.studentList &&
              sessionData.attendance.studentList.length > 0 ? (
                <View>
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-base font-medium text-gray-700">Students Present</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => exportModalRef.current?.present()}
                      className="flex-row items-center">
                      <Text className="text-sm font-medium text-blue-600">View All</Text>
                      <Ionicons name="chevron-forward" size={16} color="#2563eb" />
                    </TouchableOpacity>
                  </View>

                  {/* Show first 3 students */}
                  <View className="space-y-2">
                    {sessionData.attendance.studentList.slice(0, 3).map((student, index) => (
                      <View
                        key={`${student.username}-${index}`}
                        className="flex-row items-center rounded-lg bg-gray-50 p-3">
                        <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <Ionicons name="checkmark" size={16} color="#059669" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-gray-900">
                            {student.username}
                          </Text>
                          <Text className="text-xs text-gray-500">{student.email}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Show more indicator */}
                  {sessionData.attendance.studentList.length > 3 && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => exportModalRef.current?.present()}
                      className="mt-3 items-center rounded-lg border border-gray-200 bg-gray-50 py-3">
                      <Text className="text-sm font-medium text-gray-600">
                        +{sessionData.attendance.studentList.length - 3} more students
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="items-center rounded-lg bg-gray-50 py-6">
                  <Ionicons name="people-outline" size={32} color="#9CA3AF" />
                  <Text className="mt-2 text-sm text-gray-500">No students present</Text>
                </View>
              )}
            </View>
          )}

          {/* Export CSV modal */}
          <CustomBottomSheetModal ref={exportModalRef}>
            <BottomSheetView style={{ flex: 1, paddingHorizontal: 16 }}>
              {/* Header */}
              <View className="mb-4 flex-row items-center justify-between border-b border-gray-200 pb-4">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => exportModalRef.current?.dismiss()}>
                  <Text className="text-lg text-blue-600">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-semibold text-gray-900">Export Session</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    exportCSV();
                    exportModalRef.current?.dismiss();
                  }}
                  disabled={isLoading}
                  className={`${isLoading ? 'opacity-50' : ''}`}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                  ) : (
                    <Text className="text-lg font-medium text-blue-600">Export</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Students List */}
              <View className="mb-4">
                <Text className="mb-2 text-lg font-semibold text-gray-900">
                  Students Present ({sessionData.attendance.studentList?.length || 0})
                </Text>
              </View>

              {/* FlatList for students */}
              <BottomSheetFlatList
                data={sessionData.attendance.studentList || []}
                keyExtractor={(item, index) => `${item.username}-${index}`}
                renderItem={({ item }) => (
                  <View className="flex-row items-center justify-between border-b border-gray-100 py-3">
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-900">{item.username}</Text>
                      <Text className="text-sm text-gray-500">{item.email}</Text>
                    </View>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                  <View className="items-center justify-center py-8">
                    <Text className="text-gray-500">No students present in this session</Text>
                  </View>
                }
              />
            </BottomSheetView>
          </CustomBottomSheetModal>
        </View>
      </ScrollView>
    </View>
  );
};

export default SessionScreen;
