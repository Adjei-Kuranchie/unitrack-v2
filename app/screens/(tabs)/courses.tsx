import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomBottomSheetModal from '~/components/CustomBottomSheetModal';
import { useApiStore } from '~/store/apiStore';
import { useAuthStore } from '~/store/authStore';
import { Course } from '~/types/app';

interface NewCourseData {
  courseName: string;
  courseCode: string;
}

const CoursesScreen = () => {
  const { user, role } = useAuthStore();
  const { courses, isLoading, error, fetchCourses, addCourse, clearError } = useApiStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [newCourse, setNewCourse] = useState<NewCourseData>({
    courseName: '',
    courseCode: '',
  });

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isLecturer = role === 'LECTURER';

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const handleAddCourse = async () => {
    if (!newCourse.courseName.trim() || !newCourse.courseCode.trim()) {
      Alert.alert('Error', 'Please fill in course name and code');
      return;
    }

    try {
      await addCourse({
        lecturerId: user?.id || 0,
        courseName: newCourse.courseName.trim(),
        courseCode: newCourse.courseCode.trim(),
        department: user?.department || '',
      });

      bottomSheetRef.current?.dismiss();
      setNewCourse({ courseName: '', courseCode: '' });
      Alert.alert('Success', 'Course added successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to add course');
      bottomSheetRef.current?.dismiss();
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCourseCard = ({ item: course }: { item: Course }) => {
    const courseName = course.courseName ? String(course.courseName) : 'Unknown Course';
    const courseCode = course.courseCode ? String(course.courseCode) : 'N/A';
    const courseId = course.courseCode ? String(course.courseCode) : String(Math.random());

    const isOwnCourse = isLecturer && course.lecturerId === user?.id;

    // Generate a color based on course code for visual variety
    const getCardColor = (code: string) => {
      const colors = [
        { bg: 'bg-blue-500', accent: 'bg-blue-100', text: 'text-blue-600' },
        { bg: 'bg-purple-500', accent: 'bg-purple-100', text: 'text-purple-600' },
        { bg: 'bg-green-500', accent: 'bg-green-100', text: 'text-green-600' },
        { bg: 'bg-orange-500', accent: 'bg-orange-100', text: 'text-orange-600' },
        { bg: 'bg-pink-500', accent: 'bg-pink-100', text: 'text-pink-600' },
        { bg: 'bg-indigo-500', accent: 'bg-indigo-100', text: 'text-indigo-600' },
      ];
      const index = code.charCodeAt(0) % colors.length;
      return colors[index];
    };

    const cardColor = getCardColor(courseCode);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        key={courseId}
        className="mb-4 overflow-hidden rounded-2xl bg-white shadow-lg"
        onPress={() => {
          role === 'LECTURER' &&
            router.push({
              pathname: `/screens/details/course-lecturer`,
              params: { course: JSON.stringify(course), role: role },
            });
          role === 'STUDENT' &&
            router.push({
              pathname: `/screens/details/course-student`,
              params: { course: JSON.stringify(course), role: role },
            });
        }}>
        {/* Header with solid color background */}
        <View className={`${cardColor.bg} p-4`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">{courseCode}</Text>
              <Text className="text-sm text-white/80">Course Code</Text>
            </View>
            {isOwnCourse && (
              <View className="rounded-full bg-white/20 px-3 py-1">
                <Text className="text-xs font-medium text-white">Your Course</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View className="p-4">
          <Text className="mb-2 text-lg font-semibold text-gray-900">{courseName}</Text>

          {/* Course info */}
          <View className="mb-3 flex-row items-center">
            <View className={`mr-2 rounded-full p-2 ${cardColor.accent}`}>
              <MaterialIcons name="school" size={16} color={cardColor.bg.replace('bg-', '#')} />
            </View>
            <Text className="text-sm text-gray-600">Academic Course</Text>
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
            <View className="flex-row items-center">
              <View className="mr-2 rounded-full bg-gray-100 p-1">
                <MaterialIcons name="book" size={14} color="#6b7280" />
              </View>
              <Text className="text-xs text-gray-500">View Details</Text>
            </View>
            <View className="rounded-full bg-gray-100 p-1">
              <MaterialIcons name="chevron-right" size={16} color="#9ca3af" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="mb-6 rounded-full bg-blue-100 p-8">
        <MaterialIcons name="school" size={64} color="#6366f1" />
      </View>
      <Text className="mb-2 text-xl font-bold text-gray-900">
        {searchQuery ? 'No courses found' : 'No courses available'}
      </Text>
      <Text className="mb-6 text-center text-gray-600">
        {searchQuery
          ? `No courses match "${searchQuery}"`
          : isLecturer
            ? 'Start by adding your first course to get started'
            : 'No courses are available at the moment'}
      </Text>
      {isLecturer && !searchQuery && (
        <TouchableOpacity
          activeOpacity={0.7}
          className="rounded-xl bg-blue-600 px-6 py-3 shadow-lg"
          onPress={() => {
            bottomSheetRef.current?.present();
          }}>
          <View className="flex-row items-center">
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="ml-2 font-semibold text-white">Add Your First Course</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      {/* Enhanced Header */}
      <View className="bg-blue-600 px-4 pb-6 pt-14 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Courses</Text>
            <Text className="text-sm text-blue-100">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
            </Text>
          </View>
          <View className="rounded-full bg-white/20 p-3">
            <MaterialIcons name="school" size={28} color="white" />
          </View>
        </View>

        {/* Enhanced Search Bar */}
        <View className="mt-4 flex-row items-center rounded-2xl bg-white/20 px-4 py-3">
          <MaterialIcons name="search" size={20} color="white" />
          <TextInput
            className="ml-3 flex-1 text-white placeholder:text-white/70"
            placeholder="Search courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Courses List */}
      {isLoading && courses.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <View className="mb-4 rounded-full bg-blue-100 p-4">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
          <Text className="text-lg font-medium text-gray-900">Loading courses...</Text>
          <Text className="text-sm text-gray-600">Please wait while we fetch your courses</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item, index) =>
            item.lecturerId ? String(item.courseCode) : String(index)
          }
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Floating Action Button for Lecturers */}
      {false && ( //change to isLecturer when implemented
        <TouchableOpacity
          activeOpacity={0.7}
          className="absolute bottom-6 right-6 rounded-full bg-blue-600 p-4 shadow-lg"
          onPress={() => {
            bottomSheetRef.current?.present();
          }}>
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Enhanced Add Course Modal */}
      <CustomBottomSheetModal ref={bottomSheetRef}>
        <BottomSheetView style={{ flex: 1, width: '100%' }}>
          {/* Modal Header */}
          <BottomSheetView className="border-b border-gray-200 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => bottomSheetRef.current?.dismiss()}
                className="rounded-full bg-gray-100 p-2">
                <MaterialIcons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>

              <View className="flex-1 items-center">
                <Text className="text-xl font-bold text-gray-900">Add New Course</Text>
                <Text className="text-sm text-gray-600">Create a new course offering</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleAddCourse}
                disabled={isLoading}
                className={`rounded-full bg-blue-500 p-2 ${isLoading ? 'opacity-50' : ''}`}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialIcons name="check" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </BottomSheetView>

          {/* Enhanced Form */}
          <BottomSheetView className="flex-1 px-6 py-6">
            {/* Course Name Input */}
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-gray-900">Course Name</Text>
              <Text className="mb-3 text-sm text-gray-600">Enter the full name of the course</Text>
              <View className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <BottomSheetTextInput
                  className="text-gray-900"
                  placeholder="e.g., Introduction to Computer Science"
                  value={newCourse.courseName}
                  onChangeText={(text) => setNewCourse((prev) => ({ ...prev, courseName: text }))}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Course Code Input */}
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-gray-900">Course Code</Text>
              <Text className="mb-3 text-sm text-gray-600">Enter the unique course identifier</Text>
              <View className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <BottomSheetTextInput
                  className="text-gray-900"
                  placeholder="e.g., CSC406"
                  value={newCourse.courseCode}
                  onChangeText={(text) => setNewCourse((prev) => ({ ...prev, courseCode: text }))}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Add Course Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleAddCourse}
              disabled={isLoading || !newCourse.courseName.trim() || !newCourse.courseCode.trim()}
              className={`rounded-xl py-4 ${
                isLoading || !newCourse.courseName.trim() || !newCourse.courseCode.trim()
                  ? 'bg-gray-300'
                  : 'bg-blue-600'
              }`}>
              <View className="flex-row items-center justify-center">
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialIcons name="school" size={20} color="white" />
                    <Text className="ml-2 text-lg font-semibold text-white">Create Course</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheetView>
      </CustomBottomSheetModal>
    </View>
  );
};

export default CoursesScreen;
