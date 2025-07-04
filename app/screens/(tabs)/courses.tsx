/**
 * CoursesScreen component displays a list of courses for the authenticated user.
 *
 * - Fetches and displays courses from the API store.
 * - Allows searching/filtering courses by name or code.
 * - Supports pull-to-refresh to reload courses.
 * - For lecturers, provides the ability to add new courses via a bottom sheet modal.
 * - Handles loading and error states, and displays appropriate UI feedback.
 * - Navigates to course details when a course card is pressed.
 *
 * @component
 * @returns {JSX.Element} The rendered CoursesScreen component.
 *
 * @remarks
 * - Uses Zustand stores for authentication and API state management.
 * - Utilizes React Native and Expo Router for navigation and UI.
 * - Only lecturers can add new courses.
 *
 * @todo
 * - Investigate and fix the issue where all users see the same number of courses, sessions, and attendance records.
 */

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

//TODO: make sure to find the problem why every one has the same number of courses,sessions, attendance records, and fix it

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
    /* const lecturerName = course.lecturerName ? String(course.lecturerName) : null;
    const department = course.department ? String(course.department) : null; */
    const courseId = course.courseCode ? String(course.courseCode) : String(Math.random());

    const isOwnCourse = isLecturer && course.lecturerId === user?.id;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        key={courseId} // Fixed: Ensure string key
        className="mb-4 rounded-lg bg-white p-4 shadow-sm"
        onPress={() => {
          router.push({
            pathname: `/screens/details/course`,
            params: { course: JSON.stringify(course), role: role },
          });
        }}>
        <View className="mb-2 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{courseName}</Text>
            <Text className="text-sm font-medium text-blue-600">{courseCode}</Text>
          </View>
          {isOwnCourse && (
            <View className="rounded-full bg-green-100 px-2 py-1">
              <Text className="text-xs font-medium text-green-800">Your Course</Text>
            </View>
          )}
        </View>

        {/*  {lecturerName && (
          <Text className="mb-2 text-sm text-gray-600">Lecturer: {lecturerName}</Text>
        )}

        {department && <Text className="mb-2 text-sm text-gray-600">Department: {department}</Text>} */}

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons name="school" size={16} color="#6b7280" />
            <Text className="ml-1 text-xs text-gray-500">Course Code: {courseCode}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <MaterialIcons name="school" size={64} color="#d1d5db" />
      <Text className="mt-4 text-lg font-medium text-gray-900">No courses found</Text>
      <Text className="mt-1 text-center text-gray-600">
        {isLecturer
          ? 'Start by adding your first course'
          : 'No courses are available at the moment'}
      </Text>
      {isLecturer && (
        <TouchableOpacity
          activeOpacity={0.7}
          className="mt-4 rounded-lg bg-blue-600 px-6 py-3"
          onPress={() => {
            bottomSheetRef.current?.present();
          }}>
          <Text className="font-medium text-white">Add Course</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">Courses</Text>
          {isLecturer && (
            <TouchableOpacity
              activeOpacity={0.7}
              className="rounded-lg bg-blue-600 px-4 py-2"
              onPress={() => {
                bottomSheetRef.current?.present();
              }}>
              <View className="flex-row items-center">
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="ml-1 font-medium text-white">Add Course</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View className="mt-4 flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
          <MaterialIcons name="search" size={20} color="#6b7280" />
          <TextInput
            className="ml-2 flex-1 text-gray-900"
            placeholder="Search courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Courses List */}
      {isLoading && courses.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-2 text-gray-600">Loading courses...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses} // Fixed: Remove type casting
          renderItem={renderCourseCard}
          keyExtractor={(item, index) =>
            item.lecturerId ? String(item.courseCode) : String(index)
          } // Fixed: Ensure string key
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Add Course Modal */}
      <CustomBottomSheetModal ref={bottomSheetRef}>
        <BottomSheetView style={{ flex: 1, width: '100%' }} className="items-center">
          <BottomSheetView className="mb-15 flex-row items-center justify-between border-b border-gray-200 px-8 py-8">
            <TouchableOpacity activeOpacity={0.7} onPress={() => bottomSheetRef.current?.dismiss()}>
              <Text className="text-lg text-blue-600">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-900">Add Course</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleAddCourse}
              disabled={isLoading}
              className={`${isLoading ? 'opacity-50' : ''}`}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text className="text-lg font-medium text-blue-600">Save</Text>
              )}
            </TouchableOpacity>
          </BottomSheetView>

          {/* Input Fields */}
          <BottomSheetView className="mt-24 px-12">
            <Text className="text-md mb-2 font-semibold text-gray-700">Course Name</Text>
            <BottomSheetTextInput
              className="mb-4 rounded-lg border border-gray-300 px-3 py-3 text-gray-900"
              placeholder="Enter course name"
              value={newCourse.courseName}
              onChangeText={(text) => setNewCourse((prev) => ({ ...prev, courseName: text }))}
              placeholderTextColor="#9ca3af"
            />

            <Text className="text-md mb-2 font-semibold text-gray-700">Course Code</Text>
            <BottomSheetTextInput
              className="rounded-lg border border-gray-300 px-3 py-3 text-gray-900"
              placeholder="Enter course code (e.g., CSC406)"
              value={newCourse.courseCode}
              onChangeText={(text) => setNewCourse((prev) => ({ ...prev, courseCode: text }))}
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />
          </BottomSheetView>
        </BottomSheetView>
      </CustomBottomSheetModal>
    </View>
  );
};

export default CoursesScreen;
