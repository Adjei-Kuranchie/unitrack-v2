interface Course {
  courseName: string;
  courseCode: string;
  lecturerId: number;
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

interface ApiState {
  courses: Course[];
  sessions: Session[];
  attendance: AttendanceRecord[];
  users: any[];
  isLoading: boolean;
  error: string | null;

  // Course actions
  fetchCourses: () => Promise<void>;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;

  // Session actions
  fetchSessions: () => Promise<void>;
  createSession: (course: string) => Promise<void>;

  // Attendance actions
  fetchAttendance: () => Promise<void>;
  markAttendance: (sessionId: number, studentId: string) => Promise<void>;

  // User actions
  fetchUsers: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;

  clearError: () => void;
}
export { ApiState };
