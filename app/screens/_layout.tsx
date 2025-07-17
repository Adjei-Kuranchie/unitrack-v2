import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(auth)/RegisterScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(auth)/SignInScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="details/course-student"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="details/course-lecturer"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="details/session"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
