import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Toast } from 'au-react-native-toast';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '../global.css';

export default function Layout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#2563eb" />

      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="screens" options={{ headerShown: false }} />
            </Stack>
            <Toast />
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </>
  );
}
