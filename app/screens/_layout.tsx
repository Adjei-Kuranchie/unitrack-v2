import { Redirect } from 'expo-router';
import { useAuthStore } from '~/store/authStore';

const Layout = () => {
  const { token } = useAuthStore();
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Redirect href="/screens/(auth)/RegisterScreen" />;
  }

  return <Redirect href="/screens/(tabs)/dashboard" />;
};

export default Layout;
