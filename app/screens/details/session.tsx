import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
// TODO: Make proper interface for the session details
const SessionScreen = () => {
  const { session } = useLocalSearchParams();
  const sessionData = JSON.parse(session as string);
  return (
    <View>
      <Text>Session Details</Text>
      <Text>ID: {sessionData.id}</Text>
      <Text>Course ID: {sessionData.courseId}</Text>
      <Text>Start Time: {new Date(sessionData.startTime).toLocaleString()}</Text>
      <Text>End Time: {new Date(sessionData.endTime).toLocaleString()}</Text>
      <Text>Status: {sessionData.status}</Text>
    </View>
  );
};

export default SessionScreen;
