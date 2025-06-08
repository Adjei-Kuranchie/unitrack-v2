interface Course {
  courseName: string;
  courseCode: string;
  lecturerId: number;
}

interface SessionRequest {
  courseName: string;
  location: Location;
}
/*TODO: ask to make sure the student Index number is a string eg:"PS/CSC/21/0001"  
  or are you making it to send the user id then you query the student table to find the index number?
  it better if you don't query the db many times, i can just send the index number and then you add it to the response and then i can display it for the lecturer
*/
interface AttendanceRequest {
  sessionId: number;
  location: Location;
  studentId?: string;
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

//TODO: Ask what the attendance/lecturer and attendance/student does
interface Lecturer {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'LECTURER' | string;
  department: string | null;
  //TODO: extras?

  id: number;
  lecturerId: number;
  name: string;
  courses: Course[];
  sessions: Session[];
  attendance: Attendance[];
  department: string;
  location?: Location;
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
  studentList: Student[];
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
  createSession: (sessionReq: SessionRequest) => Promise<void>;
  // Attendance actions
  fetchAttendance: () => Promise<void>;
  markAttendance: (attendanceReq: AttendanceRequest) => Promise<void>;

  // User actions
  fetchUserProfile: () => Promise<any>;
  fetchUsers: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;

  clearError: () => void;
}
export type {
  ApiState,
  Attendance,
  AttendanceRequest,
  Course,
  Lecturer,
  Location,
  Session,
  SessionRequest,
};
