import '../global.css';

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* <Stack.Screen
        name="screens/(auth)/RegisterScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="screens/(auth)/SignInScreen"
        options={{
          headerShown: false,
        }}
      /> */}
      <Stack.Screen
        name="screens/(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
