import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Course } from '~/types/app';

const CourseDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const course: Course | undefined =
    typeof params.course === 'string' ? JSON.parse(params.course) : undefined;

  if (!course) {
    return (
      <View className="flex-1 bg-gray-50 px-6 py-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-6 flex-row items-center">
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

  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50">
      <View className="px-6 py-8">
        {/* Header with Back Button */}
        <View className="mb-8 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center rounded-full border border-gray-100 bg-white px-4 py-2 shadow-sm">
            <Ionicons name="arrow-back" size={20} color="#374151" />
            <Text className="ml-2 text-base font-medium text-gray-700">Back</Text>
          </TouchableOpacity>
        </View>

        {/* Course Header Card */}
        <View className="mb-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
          <View className="mb-4 flex-row items-center">
            <View className="mr-4 rounded-full bg-blue-500 p-3">
              <Ionicons name="book" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-2xl font-bold text-gray-800">Course Details</Text>
              <Text className="text-base text-gray-500">Academic Information</Text>
            </View>
          </View>
        </View>

        {/* Course Information Cards */}
        <View className="space-y-4">
          {/* Course Name Card */}
          <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <View className="mb-3 flex-row items-center">
              <View className="mr-3 rounded-full bg-green-100 p-2">
                <Ionicons name="school" size={20} color="#10B981" />
              </View>
              <Text className="text-lg font-semibold text-gray-700">Course Name</Text>
            </View>
            <Text className="ml-11 text-xl font-bold text-gray-800">{course.courseName}</Text>
          </View>

          {/* Course Code Card */}
          <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <View className="mb-3 flex-row items-center">
              <View className="mr-3 rounded-full bg-purple-100 p-2">
                <Ionicons name="code-slash" size={20} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-semibold text-gray-700">Course Code</Text>
            </View>
            <Text className="ml-11 font-mono text-xl font-bold text-gray-800">
              {course.courseCode}
            </Text>
          </View>

          {/* Additional Info Card - You can expand this based on your Course type */}
          {/*  <View className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-6 shadow-lg">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="mb-1 text-lg font-semibold text-white">Ready to Learn?</Text>
                <Text className="text-base text-blue-100">
                  Access course materials and resources
                </Text>
              </View>
              <TouchableOpacity className="rounded-full bg-white/20 p-3">
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View> */}
        </View>

        {/* Action Buttons */}
        {/* <View className="mt-8 flex-row space-x-4">
          <TouchableOpacity className="flex-1 rounded-2xl bg-blue-500 p-4 shadow-sm">
            <View className="flex-row items-center justify-center">
              <Ionicons name="bookmark" size={20} color="white" />
              <Text className="ml-2 text-base font-semibold text-white">Save Course</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 rounded-2xl border border-gray-200 bg-gray-100 p-4">
            <View className="flex-row items-center justify-center">
              <Ionicons name="share" size={20} color="#374151" />
              <Text className="ml-2 text-base font-semibold text-gray-700">Share</Text>
            </View>
          </TouchableOpacity>
        </View> */}
      </View>
    </ScrollView>
  );
};

export default CourseDetails;
