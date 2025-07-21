import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Toast } from 'au-react-native-toast';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '../global.css';

export default function Layout() {
  useEffect(() => {
    // Suppress specific warnings that might be related to the navigation issue
    LogBox.ignoreLogs([
      'Warning: Error: Attempted to navigate before mounting the Root Layout component',
      'Warning: The specified child already has a parent',
    ]);
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#2563eb" />

      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          <BottomSheetModalProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade', // Add fade animation to reduce navigation conflicts
              }}>
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                  gestureEnabled: false, // Disable gesture to prevent conflicts
                }}
              />
              <Stack.Screen
                name="screens"
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
            </Stack>
            <Toast />
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </>
  );
}
