import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '../global.css';

import { ReactNode } from 'react';

const ProviderWrapper = ({ children }: { children: ReactNode }) =>
  Platform.OS === 'ios' ? <KeyboardProvider>{children}</KeyboardProvider> : children;

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProviderWrapper>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="screens" options={{ headerShown: false }} />
          </Stack>
        </BottomSheetModalProvider>
      </ProviderWrapper>
    </GestureHandlerRootView>
  );
}
