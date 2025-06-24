import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StatCard } from '~/components';
import { formatDate } from '~/lib/utils';
import { useApiStore } from '~/store/apiStore';
import { useAuthStore } from '~/store/authStore';

export default function DashboardScreen() {
  const { user, token, role } = useAuthStore();
  const fetchUserProfile = useApiStore((state) => state.fetchUserProfile);
  const [profileLoading, setProfileLoading] = useState(false);

  const signOut = useAuthStore((state) => state.signOut);
  const { courses, sessions, attendance, isLoading, fetchCourses, fetchSessions, fetchAttendance } =
    useApiStore();

  const isLecturer = role === 'LECTURER';

  useEffect(() => {
    Promise.all([fetchCourses(), fetchSessions(), fetchAttendance()]);
  }, []);

  useEffect(() => {
    // Fetch user profile when component mounts if user is not already loaded
    if (token && !user) {
      loadUserProfile();
    }
  }, [token, user]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          setTimeout(() => {
            router.replace('/screens/(auth)/SignInScreen');
          }, 100);
        },
      },
    ]);
  };

  if (isLoading && courses.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-2 text-gray-600">Loading dashboard...</Text>
      </View>
    );
  }

  const loadUserProfile = async () => {
    if (!token) return;

    setProfileLoading(true);
    try {
      await fetchUserProfile();
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 py-12 pb-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-medium text-blue-100">Welcome back,</Text>
            <Text className="text-2xl font-bold text-white">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-blue-200">{isLecturer ? 'Lecturer' : 'Student'} Dashboard</Text>
          </View>
          <TouchableOpacity className="rounded-full bg-blue-500 p-2" onPress={handleSignOut}>
            <MaterialIcons name="logout" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 py-6">
        {/* Stats Grid */}
        <View className="mb-6 flex-row gap-4 space-x-4">
          <StatCard
            title="Total Courses"
            count={courses.length}
            icon="school"
            color="#10b981"
            onPress={() => router.push('/screens/(tabs)/courses')}
          />
          {isLecturer ? (
            <StatCard
              title="Sessions"
              count={sessions.length}
              icon="event"
              color="#f59e0b"
              onPress={isLecturer ? () => router.push('/screens/(tabs)/sessions') : undefined}
            />
          ) : (
            <StatCard
              title="Attendance Records"
              count={attendance.length}
              icon="fact-check"
              color="#8b5cf6"
              onPress={() => router.push('/screens/(tabs)/attendance')}
            />
          )}
        </View>

        <View className="mb-6 flex-row gap-4 space-x-4">
          <StatCard
            title="My Courses"
            count={
              isLecturer ? courses.filter((c) => c.lecturerId === user?.id).length : courses.length
            }
            icon="library-books"
            color="#ef4444"
          />
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</Text>
          <View className="space-y-3">
            {isLecturer && (
              <>
                <TouchableOpacity
                  className="flex-row items-center rounded-lg bg-white p-4 shadow-sm"
                  onPress={() => router.push('/screens/(tabs)/courses')}>
                  <MaterialIcons name="add-circle" size={24} color="#2563eb" />
                  <Text className="ml-3 font-medium text-gray-900">Add New Course</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center rounded-lg bg-white p-4 shadow-sm"
                  onPress={() => router.push('/screens/(tabs)/sessions')}>
                  <MaterialIcons name="event-note" size={24} color="#10b981" />
                  <Text className="ml-3 font-medium text-gray-900">Create Session</Text>
                </TouchableOpacity>
              </>
            )}
            {role === 'STUDENT' && (
              <TouchableOpacity
                className="flex-row items-center rounded-lg bg-white p-4 shadow-sm"
                onPress={() => router.push('/screens/(tabs)/attendance')}>
                <MaterialIcons name="check-circle" size={24} color="#f59e0b" />
                <Text className="ml-3 font-medium text-gray-900">
                  {isLecturer ? 'View Attendance' : 'Mark Attendance'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Uncomment this section when profile update is implemented */}
            {/* <TouchableOpacity
              className="flex-row items-center rounded-lg bg-white p-4 shadow-sm"
              onPress={() => router.push('/screens/(tabs)/profile')}>
              <MaterialIcons name="person" size={24} color="#8b5cf6" />
              <Text className="ml-3 font-medium text-gray-900">Update Profile</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Recent Activity */}
        <View>
          <Text className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</Text>
          <View className="rounded-lg bg-white p-4 shadow-sm">
            {sessions.length > 0 ? (
              sessions.slice(0, 3).map((session, index) => (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/screens/details/session',
                      params: { session: JSON.stringify(session) },
                    })
                  }
                  key={session.id}
                  className={`${index > 0 ? 'mt-3 border-t border-gray-200 pt-3' : ''}`}>
                  <Text className="font-medium text-gray-900">
                    {typeof session.course.courseCode === 'string' && session.course.courseCode} -{' '}
                    {typeof session.course.courseName === 'string' && session.course.courseName}
                  </Text>

                  <Text className="text-sm text-gray-600">
                    Session created • {formatDate(session.startTime)}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-center text-gray-500">No recent activity</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
