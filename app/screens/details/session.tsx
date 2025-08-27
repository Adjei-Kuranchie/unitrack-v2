import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BottomSheetFlatList, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomBottomSheetModal from '~/components/CustomBottomSheetModal';
import { formatDateForFilename, formatDateTime } from '~/lib/utils';
import { useApiStore } from '~/store/apiStore';
import { Session } from '~/types/app';

const SessionScreen = () => {
  const { session } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, fetchActiveSessions, activeSessions } = useApiStore();

  // Parse initial session data
  const initialSessionData: Session = JSON.parse(session as string);

  // State for current session data
  const [sessionData, setSessionData] = useState<Session>(initialSessionData);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const startDateTime = formatDateTime(sessionData.startTime);
  const endDateTime = formatDateTime(sessionData.endTime);

  // Function to update session data from store
  const updateSessionData = useCallback(() => {
    const updatedSession = activeSessions.find((s) => s.id === sessionData.id);
    if (updatedSession) {
      setSessionData(updatedSession);
      setLastUpdated(new Date());
    }
  }, [activeSessions, sessionData.id]);

  // Real-time updates
  useEffect(() => {
    // Don't poll if session is closed
    if (sessionData.status === 'CLOSED') {
      return;
    }
    const fetchAndUpdate = async () => {
      setIsUpdating(true);
      try {
        await fetchActiveSessions();
        updateSessionData();
      } catch (error) {
        console.error('Failed to update session:', error);
      } finally {
        setIsUpdating(false);
      }
    };

    // Initial fetch
    fetchAndUpdate();

    // Set up polling
    const interval = setInterval(fetchAndUpdate, 5000); // 5 seconds for better real-time feel

    return () => clearInterval(interval);
  }, [fetchActiveSessions, updateSessionData, sessionData.status]);

  // Manual refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchActiveSessions();
      updateSessionData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get attendance stats
  const getAttendanceStats = () => {
    const studentList = sessionData.attendance?.studentList || [];
    const total = studentList.length;

    return {
      total,
      newStudents: studentList.filter((s) => {
        // Check if student joined in last 5 minutes
        const joinTime = new Date(sessionData.startTime);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return joinTime > fiveMinutesAgo;
      }).length,
    };
  };

  const stats = getAttendanceStats();

  //export functionality
  const exportModalRef = useRef<BottomSheetModal>(null);

  const exportCSV = async () => {
    try {
      if (!sessionData.attendance.studentList || sessionData.attendance.studentList.length === 0) {
        alert('No students to export');
        return;
      }

      const headers = [
        'Student ID',
        'Username',
        'Email',
        'Course Code',
        'Course Name',
        'Session Date',
        'Session Time',
      ];

      const rows = sessionData.attendance.studentList.map((student) => [
        student.IndexNumber || student.username,
        student.username,
        student.email,
        sessionData.course.courseCode,
        sessionData.course.courseName,
        startDateTime.date,
        startDateTime.time,
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((field) => `"${field}"`).join(','))
        .join('\n');

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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: 'radio-button-on',
          label: 'Active Session',
        };
      case 'CLOSED':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: 'stop-circle',
          label: 'Session Ended',
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: 'schedule',
          label: 'Scheduled',
        };
    }
  };

  const exportPDF = async () => {
    try {
      setIsExporting(true);

      if (!sessionData.attendance.studentList || sessionData.attendance.studentList.length === 0) {
        alert('No students to export');
        return;
      }

      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2563eb; text-align: center; }
            h2 { color: #1e40af; margin-top: 30px; }
            .header-info { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #2563eb; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Attendance Report</h1>
          
          <div class="header-info">
            <div class="info-row">
              <span class="label">Course:</span> ${sessionData.course.courseCode} - ${sessionData.course.courseName}
            </div>
            <div class="info-row">
              <span class="label">Session ID:</span> #${sessionData.id}
            </div>
            <div class="info-row">
              <span class="label">Date:</span> ${startDateTime.date}
            </div>
            <div class="info-row">
              <span class="label">Time:</span> ${startDateTime.time} - ${endDateTime.time}
            </div>
            <div class="info-row">
              <span class="label">Lecturer:</span> ${sessionData.lecturer.firstName} ${sessionData.lecturer.lastName}
            </div>
            <div class="info-row">
              <span class="label">Total Students:</span> ${sessionData.attendance.studentList.length}
            </div>
          </div>
          
          <h2>Students Present</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>Username</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${sessionData.attendance.studentList
                .map(
                  (student, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${student.IndexNumber || student.username}</td>
                    <td>${student.username}</td>
                    <td>${student.email}</td>
                  </tr>
                `
                )
                .join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

      const { uri } = await Print.printToFileAsync({ html });

      const dateForFilename = formatDateForFilename(sessionData.startTime);
      const pdfName = `attendance_${sessionData.course.courseCode}_${dateForFilename}.pdf`;

      const newUri = `${FileSystem.documentDirectory}${pdfName}`;

      // Move/rename the file
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export Attendance Report',
        UTI: 'com.adobe.pdf',
      });

      exportModalRef.current?.dismiss();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const statusInfo = getStatusInfo(sessionData.status);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-slate-50">
      {/* Enhanced Header */}
      <View className="bg-blue-600 px-6 pb-6 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="rounded-full bg-white/20 p-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Session Details</Text>
          <View className="rounded-full bg-white/20 px-4 py-2">
            <Text className="text-sm font-semibold text-white">#{sessionData.id}</Text>
          </View>
        </View>

        {/* Course Info in Header */}
        <View className="rounded-2xl bg-white/10 p-4">
          <Text className="text-center text-sm font-medium text-blue-100">COURSE</Text>
          <Text className="text-center text-2xl font-bold text-white">
            {sessionData.course?.courseCode}
          </Text>
          <Text className="text-center text-base text-blue-100">
            {sessionData.course?.courseName}
          </Text>
        </View>

        {/* Live Update Indicator */}
        <View className="mt-3 flex-row items-center justify-center">
          <View
            className={`mr-2 h-2 w-2 rounded-full ${isUpdating ? 'bg-yellow-400' : 'bg-green-400'}`}
          />
          <Text className="text-xs text-white/80">
            {isUpdating ? 'Updating...' : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </Text>
        </View>
      </View>

      <ScrollView
        className="mt-2 flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="gap-6 space-y-4 px-6 pt-6">
          {/* Status Card */}
          <View
            className=" rounded-2xl bg-white shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className={`${statusInfo.bgColor} p-4`}>
              <View className="flex-row items-center justify-center">
                <View className={`mr-3 rounded-full ${statusInfo.color} p-2`}>
                  <MaterialIcons name={statusInfo.icon as any} size={20} color="white" />
                </View>
                <View>
                  <Text className={`text-base font-semibold ${statusInfo.textColor}`}>
                    {statusInfo.label}
                  </Text>
                  <Text className="text-sm text-gray-500">Current status</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Enhanced Attendance Summary */}
          {sessionData.attendance && (
            <View
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
              {/* Header */}
              <View className="bg-blue-500 p-6">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white/80">Attendance Summary</Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-3xl font-bold text-white">
                        {sessionData.attendance.studentList?.length || 0}
                      </Text>
                      {stats.newStudents > 0 && (
                        <Text className="ml-2 text-sm text-yellow-300">
                          (+{stats.newStudents} new)
                        </Text>
                      )}
                    </View>
                    <Text className="text-white/80">Students Present</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => exportModalRef.current?.present()}
                    className="rounded-full bg-white/20 p-3">
                    <Ionicons name="download" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Content */}
              <View className="p-6">
                {sessionData.attendance.studentList &&
                sessionData.attendance.studentList.length > 0 ? (
                  <View>
                    <View className="mb-4 flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-gray-900">
                        Students Present
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => exportModalRef.current?.present()}
                        className="flex-row items-center rounded-lg bg-blue-50 px-3 py-2">
                        <Text className="text-sm font-medium text-blue-600">View All</Text>
                        <Ionicons name="chevron-forward" size={16} color="#2563eb" />
                      </TouchableOpacity>
                    </View>

                    {/* Student Preview */}
                    <View className="space-y-3">
                      {sessionData.attendance.studentList.slice(0, 3).map((student, index) => (
                        <View
                          key={`${student.username}-${index}`}
                          className="flex-row items-center rounded-xl bg-green-50 p-4">
                          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-500">
                            <MaterialIcons name="check" size={20} color="white" />
                          </View>
                          <View className="flex-1">
                            <Text className="font-semibold text-gray-900">
                              {student.IndexNumber ?? student.username}
                            </Text>
                            <Text className="text-sm text-gray-500">{student.email}</Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    {sessionData.attendance.studentList.length > 3 && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => exportModalRef.current?.present()}
                        className="mt-4 items-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-4">
                        <Text className="font-medium text-gray-600">
                          +{sessionData.attendance.studentList.length - 3} more students
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <View className="mb-4 rounded-full bg-gray-100 p-6">
                      <MaterialIcons name="people-outline" size={48} color="#9CA3AF" />
                    </View>
                    <Text className="text-lg font-medium text-gray-900">No Attendance Yet</Text>
                    <Text className="text-center text-sm text-gray-500">
                      Students haven&apos;t marked attendance for this session
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Enhanced Timeline */}
          <View
            className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 rounded-full bg-blue-100 p-2">
                <Ionicons name="time" size={20} color="#3b82f6" />
              </View>
              <Text className="text-lg font-semibold text-gray-900">Session Timeline</Text>
            </View>

            <View className="relative">
              {/* Start Time */}
              <View className="mb-8 flex-row items-start">
                <View className="relative mr-4 mt-2">
                  <View className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-100" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-green-600">START TIME</Text>
                  <Text className="mt-1 text-2xl font-bold text-gray-900">
                    {startDateTime.time}
                  </Text>
                  <Text className="text-sm text-gray-500">{startDateTime.date}</Text>
                </View>
              </View>

              {/* End Time */}
              <View className="flex-row items-start">
                <View className="relative mr-4 mt-2">
                  <View className="h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-100" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-red-600">END TIME</Text>
                  <Text className="mt-1 text-2xl font-bold text-gray-900">{endDateTime.time}</Text>
                  <Text className="text-sm text-gray-500">{endDateTime.date}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Location Card */}
          {sessionData.location && (
            <View
              className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 rounded-full bg-purple-100 p-3">
                  <Ionicons name="location" size={24} color="#8b5cf6" />
                </View>
                <Text className="text-lg font-semibold text-gray-900">Session Location</Text>
              </View>
              <View className="rounded-xl bg-gray-50 p-4">
                <Text className="text-sm text-gray-500">GPS Coordinates</Text>
                <Text className="font-mono text-lg font-semibold text-gray-900">
                  {sessionData.location.latitude.toFixed(6)},{' '}
                  {sessionData.location.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          )}

          {/* Lecturer Card */}
          {sessionData.lecturer && (
            <View
              className="mb-4 overflow-hidden rounded-2xl bg-white p-6 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 rounded-full bg-blue-100 p-3">
                  <MaterialIcons name="person" size={24} color="#3b82f6" />
                </View>
                <Text className="text-lg font-semibold text-gray-900">Lecturer Information</Text>
              </View>

              <View className="space-y-3">
                <View>
                  <Text className="text-sm text-gray-500">Name</Text>
                  <Text className="text-xl font-bold text-gray-900">
                    {sessionData.lecturer.firstName} {sessionData.lecturer.lastName}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm text-gray-500">Email</Text>
                  <Text className="text-base text-gray-700">{sessionData.lecturer.email}</Text>
                </View>
                {sessionData.lecturer.department.departmentName && (
                  <View>
                    <Text className="text-sm text-gray-500">Department</Text>
                    <Text className="text-base text-gray-700">
                      {sessionData.lecturer.department.departmentName}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Export Modal */}
          <CustomBottomSheetModal ref={exportModalRef}>
            <BottomSheetView style={{ flex: 1, paddingHorizontal: 16 }}>
              <View className="mb-4 flex-row items-center justify-between border-b border-gray-200 pb-4">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => exportModalRef.current?.dismiss()}>
                  <Text className="text-lg text-gray-600">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Export Attendance</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={exportCSV}
                    disabled={isExporting}
                    className={`rounded-lg bg-blue-500 px-4 py-2 ${isExporting ? 'opacity-50' : ''}`}>
                    {isExporting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="font-semibold text-white">CSV</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={exportPDF}
                    disabled={isExporting}
                    className={`rounded-lg bg-green-500 px-4 py-2 ${isExporting ? 'opacity-50' : ''}`}>
                    {isExporting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="font-semibold text-white">PDF</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <BottomSheetFlatList
                data={sessionData.attendance.studentList || []}
                keyExtractor={(item, index) => `${item.username}-${index}`}
                renderItem={({ item }) => (
                  <View className="flex-row items-center border-b border-gray-100 py-4">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <MaterialIcons name="person" size={20} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">{item.username}</Text>
                      <Text className="text-sm text-gray-500">{item.email}</Text>
                    </View>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                  <View className="items-center justify-center py-12">
                    <MaterialIcons name="people-outline" size={48} color="#9CA3AF" />
                    <Text className="mt-4 text-gray-500">No students present</Text>
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
