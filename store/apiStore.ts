import { create } from 'zustand';
import { useAuthStore } from '~/store/authStore';
import { ApiState } from '~/types/app';

import Constants from 'expo-constants';
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export const useApiStore = create<ApiState>((set, get) => ({
  courses: [],
  sessions: [],
  attendance: [],
  users: [],
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses`, {
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
        body: JSON.stringify(course),
      });

      if (!response.ok) {
        throw new Error('Failed to add course');
      }

      // Refresh courses after adding
      await get().fetchCourses();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add course',
        isLoading: false,
      });
    }
  },

  fetchSessions: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/session`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const sessions = await response.json();
      set({ sessions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch sessions',
        isLoading: false,
      });
    }
  },

  createSession: async (course) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/session/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ course }),
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
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }

      const attendance = await response.json();
      set({ attendance, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch attendance',
        isLoading: false,
      });
    }
  },

  markAttendance: async (sessionId, studentId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/attendance/mark`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sessionId, studentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }

      // Refresh attendance after marking
      await get().fetchAttendance();
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Refresh users after updating
      await get().fetchUsers();
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
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

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
