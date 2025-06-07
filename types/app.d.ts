interface Course {
  courseName: string;
  courseCode: string;
  lecturerId: number;
}

interface Session {
  id: number;
  status: 'ACTIVE' | 'CLOSED';
  startTime: string;
  endTime: string;
  location: Location;
  lecturer: Lecturer;
  course: Course;
  attendance: Attendance;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface Lecturer {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'LECTURER' | string;
  department: string | null;
}

interface Student {
  username: string;
  firstName: string;
  lastName: string;
  program: string;
  IndexNumber: string;
  email: string;
  role: 'STUDENT' | string;
}

interface Attendance {
  courseName: string;
  date: string;
  time: string;
  lecturer: string;
  studentList: Student[]; // Define `Student` based on your structure
}

interface ApiState {
  courses: Course[];
  sessions: Session[];
  attendance: Attendance[];
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
  fetchUserProfile: () => Promise<any>;
  fetchUsers: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;

  clearError: () => void;
}
export type { ApiState, Attendance, Course, Lecturer, Location, Session };
