interface Course {
  id: number;
  courseName: string;
  courseCode: string;
  lecturer: number;
}

interface Session {
  id: number;
  course: string;
  createdAt: string;
}

interface AttendanceRecord {
  id: number;
  sessionId: number;
  studentId: string;
  timestamp: string;
}

interface AppState {
  courses: Course[];
  sessions: Session[];
  attendance: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;

  // Course actions
  fetchCourses: () => Promise<void>;
  addCourse: (courseData: Omit<Course, 'id'>) => Promise<void>;

  // Session actions
  fetchSessions: () => Promise<void>;
  createSession: (course: string) => Promise<void>;

  // Attendance actions
  fetchAttendance: () => Promise<void>;
  markAttendance: (sessionId: number, studentId: string) => Promise<void>;

  clearError: () => void;
}

export { AppState };
