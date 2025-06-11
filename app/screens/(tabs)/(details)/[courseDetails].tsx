import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Course } from '~/types/app';

const CourseDetails = () => {
  const params = useLocalSearchParams();
  // If course is passed as a JSON string in the query, parse it
  const course: Course | undefined = params.course
    ? typeof params.course === 'string'
      ? JSON.parse(params.course)
      : params.course
    : undefined;

  if (!course) {
    return (
      <View>
        <Text>No course details found.</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Course Details</Text>
      <Text>Name: {course.courseName}</Text>
      <Text>Code: {course.courseCode}</Text>
    </View>
  );
};
export default CourseDetails;
