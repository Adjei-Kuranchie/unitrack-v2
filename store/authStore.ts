/**
 * Zustand store for authentication state management.
 *
 * This store handles user authentication, registration, and session persistence using AsyncStorage.
 * It provides actions for signing in, registering, setting user data, signing out, and clearing errors.
 *
 * @remarks
 * - Uses `zustand` for state management and `zustand/middleware` for persistence.
 * - Persists authentication state in AsyncStorage under the key 'auth-storage'.
 * - Communicates with the backend API using the base URL from Expo Constants.
 *
 * @example
 * ```typescript
 * const { signIn, signOut, user, token } = useAuthStore();
 * await signIn('username', 'password');
 * ```
 *
 * @see {@link AuthState}
 * @see {@link RegisterData}
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AuthState, RegisterData } from '~/types/auth';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      resMessage: null,
      token: null,
      role: null,
      isLoading: false,
      error: null,

      signIn: async (username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/signIn`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          const data = await response.json();

          set({
            resMessage: true,
            role: data.role,
            token: data.jwt,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Sign in failed',
            isLoading: false,
          });
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Registration failed');
          }

          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
        }
      },

      setUser: (userData) => {
        set({ user: userData });
      },
      signOut: () => {
        set({ user: null, token: null, role: null, resMessage: null, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
