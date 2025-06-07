import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuthStore } from '~/store/authStore';
const Index = () => {
  const { user } = useAuthStore();

  if (!user) {
    router.replace('/screens/(auth)/SignInScreen');
    return null;
  }

  return (
    <View>
      <Text>Index</Text>
    </View>
  );
};
export default Index;
