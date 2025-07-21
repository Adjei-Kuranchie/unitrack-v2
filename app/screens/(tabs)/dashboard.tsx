import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { formatDate } from '~/lib/utils';
import { useApiStore } from '~/store/apiStore';
import { useAuthStore } from '~/store/authStore';

interface QuickActionCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description: string;
  color: string;
  onPress: () => void;
}

export default function DashboardScreen() {
  const { user, token, role } = useAuthStore();
  const fetchUserProfile = useApiStore((state) => state.fetchUserProfile);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  const signOut = useAuthStore((state) => state.signOut);
  const { courses, sessions, attendance, isLoading, fetchCourses, fetchSessions, fetchAttendance } =
    useApiStore();

  const isLecturer = role === 'LECTURER';

  useEffect(() => {
    Promise.all([fetchCourses(), fetchSessions(), fetchAttendance()]);
  }, []);

  useEffect(() => {
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
      <View className="flex-1 items-center justify-center bg-slate-50">
        <View className="mb-4 rounded-full bg-blue-100 p-4">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
        <Text className="text-lg font-medium text-gray-900">Loading dashboard...</Text>
        <Text className="text-sm text-gray-600">Please wait while we fetch your data</Text>
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

  // Get greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour > 3 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Quick action card with better visual design
  const QuickActionCard: React.FC<QuickActionCardProps> = ({
    icon,
    label,
    description,
    color,
    onPress,
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm"
      onPress={onPress}>
      <View className="flex-row items-center p-4">
        <View className={`mr-4 rounded-xl ${color} p-3`}>
          <MaterialIcons name={icon} size={24} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{label}</Text>
          <Text className="text-sm text-gray-500">{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  const recentSessions = sessions
    .filter((session) => session.lecturer?.email === user?.email)
    .slice(0, 3);

  // Calculate active sessions
  const activeSessions = sessions.filter((s) => s.status === 'ACTIVE').length;
  const myCourses = isLecturer
    ? courses.filter((c) => c.lecturerId === user?.id).length
    : courses.length;

  return (
    <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
      {/*  Header  */}
      <View className="bg-blue-600 px-6 pb-8 pt-12">
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base text-blue-100">{getGreeting()},</Text>
            <Text className="text-2xl font-bold text-white">
              {user?.firstName} {user?.lastName}
            </Text>
            <View className="mt-2 flex-row items-center">
              <View className="rounded-full bg-white/20 px-3 py-1">
                <Text className="text-xs font-medium text-white">
                  {isLecturer ? 'Lecturer' : 'Student'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            className="rounded-full bg-white/20 p-3"
            onPress={handleSignOut}>
            <MaterialIcons name="logout" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Overview Cards  */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-1"
            onPress={() => router.push('/screens/(tabs)/courses')}>
            <View className="relative overflow-hidden rounded-2xl bg-white/10 p-5">
              <View className="absolute right-4 top-4">
                <View className="rounded-full bg-blue-100 p-2">
                  <MaterialIcons name="school" size={20} color="#3b82f6" />
                </View>
              </View>
              <View className="pr-12">
                <Text className="text-5xl font-bold text-white">{courses.length}</Text>
                <Text className="mt-1 text-sm font-medium text-white/70">Total Courses</Text>
              </View>
            </View>
          </TouchableOpacity>

          {isLecturer ? (
            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-1"
              onPress={() => router.push('/screens/(tabs)/sessions')}>
              <View className="relative overflow-hidden rounded-2xl bg-white/10 p-5">
                <View className="absolute right-4 top-4">
                  <View className="rounded-full bg-orange-100 p-2">
                    <MaterialIcons name="event" size={20} color="#f97316" />
                  </View>
                </View>
                <View className="pr-12">
                  <Text className="text-5xl font-bold text-white">{sessions.length}</Text>
                  <Text className="mt-1 text-sm font-medium text-white/70">Total Sessions</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-1"
              onPress={() => router.push('/screens/(tabs)/attendance')}>
              <View className="relative overflow-hidden rounded-2xl bg-white/10 p-5">
                <View className="absolute right-4 top-4">
                  <View className="rounded-full bg-purple-100 p-2">
                    <MaterialIcons name="fact-check" size={20} color="#9333ea" />
                  </View>
                </View>
                <View className="pr-12">
                  <Text className="text-5xl font-bold text-white">{attendance.length}</Text>
                  <Text className="mt-1 text-sm font-medium text-white/70">Attendance</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View className="px-6 py-6">
        {/* Activity Summary */}
        <View className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">Activity Summary</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <View className="mb-2 rounded-full bg-green-100 p-3">
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
              <Text className="text-xl font-bold text-gray-900">{activeSessions}</Text>
              <Text className="text-xs text-gray-500">Active</Text>
            </View>
            <View className="items-center">
              <View className="mb-2 rounded-full bg-blue-100 p-3">
                <Ionicons name="book" size={24} color="#3b82f6" />
              </View>
              <Text className="text-xl font-bold text-gray-900">{myCourses}</Text>
              <Text className="text-xs text-gray-500">My Courses</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</Text>
          {isLecturer ? (
            <>
              <QuickActionCard
                icon="add-circle"
                label="Create New Course"
                description="Add a new course to your teaching portfolio"
                color="bg-blue-500"
                onPress={() => router.push('/screens/(tabs)/courses')}
              />
              <QuickActionCard
                icon="event-note"
                label="Start New Session"
                description="Begin a class session for attendance"
                color="bg-green-500"
                onPress={() => router.push('/screens/(tabs)/sessions')}
              />
              {/* <QuickActionCard
                icon="analytics"
                label="View Analytics"
                description="Check attendance patterns and insights"
                color="bg-purple-500"
                onPress={() => router.push('/screens/(tabs)/attendance')}
              /> */}
            </>
          ) : (
            <>
              <QuickActionCard
                icon="qr-code-scanner"
                label="Mark Attendance"
                description="Scan QR code to mark your attendance"
                color="bg-orange-500"
                onPress={() => router.push('/screens/(tabs)/attendance')}
              />
              <QuickActionCard
                icon="history"
                label="Attendance History"
                description="View your attendance records"
                color="bg-blue-500"
                onPress={() => router.push('/screens/(tabs)/attendance')}
              />
            </>
          )}
        </View>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <View>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">Recent Sessions</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/screens/(tabs)/sessions')}>
                <Text className="text-sm font-medium text-blue-500">View All</Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-3">
              {recentSessions.map((session) => {
                const statusColor = session.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400';
                return (
                  <TouchableOpacity
                    key={session.id}
                    activeOpacity={0.7}
                    className="overflow-hidden rounded-xl bg-white shadow-sm"
                    onPress={() =>
                      router.push({
                        pathname: '/screens/details/session',
                        params: { session: JSON.stringify(session) },
                      })
                    }>
                    <View className="flex-row items-center p-4">
                      <View className={`mr-3 h-12 w-1 rounded-full ${statusColor}`} />
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                          {session.course.courseCode} - {session.course.courseName}
                        </Text>
                        <View className="mt-1 flex-row items-center">
                          <Ionicons name="time-outline" size={14} color="#6b7280" />
                          <Text className="ml-1 text-sm text-gray-500">
                            {formatDate(session.startTime)}
                          </Text>
                          {session.status === 'ACTIVE' && (
                            <View className="ml-3 flex-row items-center">
                              <View className="mr-1 h-2 w-2 rounded-full bg-green-500" />
                              <Text className="text-xs font-medium text-green-600">Live</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
