import '../global.css';

import { Stack } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function Layout() {
  return (
    <KeyboardProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="screens"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </KeyboardProvider>
  );
}
