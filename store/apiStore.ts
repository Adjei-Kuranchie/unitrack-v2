/**
 * Zustand store for managing API state and actions in the application.
 *
 * This store provides methods to interact with the backend API for operations such as:
 * - Fetching and updating user profiles
 * - Managing courses (fetch, add)
 * - Managing sessions (fetch, create)
 * - Managing attendance (fetch, mark)
 * - Managing users (fetch, update, delete)
 *
 * The store maintains loading and error states for UI feedback.
 *
 * @remarks
 * - Uses the authentication token from `useAuthStore` for authorized requests.
 * - Automatically refreshes relevant data after mutations (e.g., after adding a course, creating a session, etc.).
 * - Handles API errors and exposes them via the `error` state.
 *
 * @example
 * ```typescript
 * const { fetchCourses, courses, isLoading, error } = useApiStore();
 * useEffect(() => {
 *   fetchCourses();
 * }, []);
 * ```
 *
 * @see ApiState
 * @see useAuthStore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import uuid from 'react-native-uuid';
import { create } from 'zustand';
import { useAuthStore } from '~/store/authStore';
import { ApiState, Attendance, AttendanceRequest } from '~/types/app';
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
import * as SecureStore from "expo-secure-store"
;
const DEVICE_ID_KEY = 'device_id';

/**
 * Gets or generates a unique device ID
 * @returns Promise<string> - The device ID
 */
const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    if (!deviceId) {
      deviceId = uuid.v4();

      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Error getting/generating device ID:', error);
    return uuid.v4();
  }
};
/**
 * Generates authentication headers with optional device ID
 * @param mark - Whether to include device ID (for attendance marking)
 * @returns Promise<object> - Headers object
 */
const getAuthHeaders = async (
  mark?: boolean
): Promise<{
  'Content-Type': string;
  Authorization: string;
  'X-Device_ID'?: string;
}> => {
  const token = useAuthStore.getState().token;

  const headers: {
    'Content-Type': string;
    Authorization: string;
    'X-Device_ID'?: string;
  } = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    'X-Device_ID': mark ? await getDeviceId() : '',
  };

  // console.log(headers['X-Device_ID']);

  return headers;
};

export const useApiStore = create<ApiState>((set, get) => ({
  courses: [],
  sessions: [],
  activeSessions: [],
  closedSessions: [],
  attendance: [],
  users: [],
  isLoading: false,
  error: null,

  fetchUserProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      // Update the user in auth store
      useAuthStore.getState().setUser(userData);

      set({ isLoading: false });
      return userData;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user profile',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchCourses: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const courses = await response.json();
      set({ courses, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch courses',
        isLoading: false,
      });
    }
  },

  //TODO:Make sure to add privileges to add course
  addCourse: async (course) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/add`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(course),
      });

      if (!response.ok) {
        const errorText = await response.text();
        set({
          error: errorText || 'Failed to add course',
          isLoading: false,
        });
        throw new Error(errorText || 'Failed to add course');
      }

      // Refresh courses after adding
      await get().fetchCourses();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add course',
        isLoading: false,
      });
      throw error; // Ensure error is thrown to be caught in UI
    }
  },

  fetchSessions: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/session?size=1000`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const sessions = await response.json();
      set({ sessions: sessions.content, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch sessions',
        isLoading: false,
      });
    }
  },

  fetchActiveSessions: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/session/active`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active sessions');
      }

      const sessions = await response.json();
      set({ activeSessions: sessions, isLoading: false });
    } catch (error) {
      console.log(error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch active sessions',
        isLoading: false,
      });
    }
  },

  fetchClosedSessions: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/session/closed`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const sessions = await response.json();
      set({ closedSessions: sessions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch sessions',
        isLoading: false,
      });
    }
  },

  createSession: async (sessionReq, time = 300) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/session/create?time=${time}`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(sessionReq),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      // Refresh sessions after creating
      await get().fetchSessions();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create session',
        isLoading: false,
      });
    }
  },

  fetchAttendance: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/attendance`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }

      const attendance: Attendance[] = await response.json();
      set({ attendance, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch attendance',
        isLoading: false,
      });
    }
  },

  fetchSingleAttendance: async (attendanceId: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/attendance/one?id=${attendanceId}`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }

      const attendance: Attendance = await response.json();
      set({ isLoading: false });
      return attendance;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch attendance',
        isLoading: false,
      });
    }
  },

  markAttendance: async (attendanceReq: AttendanceRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/attendance/mark`, {
        method: 'POST',
        headers: await getAuthHeaders(true),
        body: JSON.stringify(attendanceReq),
      });

      if (!response.ok) {
        // console.log('Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        set({
          error: errorText || 'Failed to mark attendance',
          isLoading: false,
        });
        throw new Error(errorText || 'Failed to mark attendance');
      }

      // Add a small delay to ensure backend processing completes
      await new Promise((resolve) => setTimeout(resolve, 500));

      return true; // Indicate success
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark attendance',
        isLoading: false,
      });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();
      set({ users, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        isLoading: false,
      });
    }
  },

  updateUser: async (userData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/update`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        //TODO: Remind to give permissions to update user
        // console.log(response);

        throw new Error('Failed to update user');
      }

      // Refresh user profile after updating
      await get().fetchUserProfile();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update user',
        isLoading: false,
      });
    }
  },

  deleteUser: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/delete/${userId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      const result = await response.text();
      console.log('Delete user response:', result);

      // Refresh users after deleting
      await get().fetchUsers();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete user',
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
