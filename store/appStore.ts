import { create } from 'zustand';
import { AppState } from '~/types/app';
import { useAuthStore } from '~/store/authStore';

// stores/appStore.ts
const API_BASE_URL = process.env.API_BASE_URL;

export const useAppStore = create<AppState>((set, get) => ({
  courses: [],
  sessions: [],
  attendance: [],
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch courses');

      const courses = await response.json();
      set({ courses, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch courses',
        isLoading: false,
      });
    }
  },

  addCourse: async (courseData) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) throw new Error('Failed to add course');

      // Refresh courses list
      await get().fetchCourses();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add course',
        isLoading: false,
      });
    }
  },

  fetchSessions: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch sessions');

      const sessions = await response.json();
      set({ sessions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch sessions',
        isLoading: false,
      });
    }
  },

  createSession: async (course: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/session/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course }),
      });

      if (!response.ok) throw new Error('Failed to create session');

      // Refresh sessions list
      await get().fetchSessions();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create session',
        isLoading: false,
      });
    }
  },

  fetchAttendance: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch attendance');

      const attendance = await response.json();
      set({ attendance, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch attendance',
        isLoading: false,
      });
    }
  },

  markAttendance: async (sessionId: number, studentId: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/attendance/mark`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, studentId }),
      });

      if (!response.ok) throw new Error('Failed to mark attendance');

      // Refresh attendance list
      await get().fetchAttendance();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark attendance',
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
