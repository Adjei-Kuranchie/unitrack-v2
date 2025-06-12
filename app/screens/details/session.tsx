import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDateTime } from '~/lib/utils';

const SessionScreen = () => {
  const { session } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sessionData = JSON.parse(session as string);

  const startDateTime = formatDateTime(sessionData.startTime);
  const endDateTime = formatDateTime(sessionData.endTime);

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
          onPress={() => router.back()}
          className="-ml-2 rounded-full p-2"
          activeOpacity={0.7}>
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
                {sessionData.lecturer.department && (
                  <Text className="text-sm text-gray-500">{sessionData.lecturer.department}</Text>
                )}
              </View>
            </View>
          )}

          {/* Attendance Summary */}
          {sessionData.attendance && (
            <View className="rounded-xl bg-white p-4 shadow-sm">
              <Text className="mb-3 text-sm text-gray-500">Attendance</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={20} color="#6B7280" />
                  <Text className="ml-2 text-base font-medium text-gray-900">Students Present</Text>
                </View>
                <Text className="text-xl font-bold text-blue-600">
                  {sessionData.attendance.studentList?.length || 0}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SessionScreen;
