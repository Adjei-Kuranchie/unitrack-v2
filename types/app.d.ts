import { User } from '~/types/auth';

type departmentName = 'Art' | 'Science' | 'Economics' | 'Law';

/**
 * Represents a course offered in the system.
 * @property courseName - The name of the course.
 * @property courseCode - The unique code identifying the course.
 * @property lecturerId - The ID of the lecturer assigned to the course.
 */
interface Course {
  courseName: string;
  courseCode: string;
  lecturerId: number;
  department: string;
}

/**
 * Represents a department within the system.
 * @property id - The unique identifier for the department.
 * @property departmentName - The name of the department.
 * @property users - The list of users associated with the department.
 * @property courses - The list of courses offered by the department.
 */
interface Department {
  id: number;
  departmentName: departmentName;
  users: User[];
  courses: Course[]; // List of courses offered by the department
}

/**
 * Request payload for creating a session.
 * @property courseName - The name of the course for the session.
 * @property location - The location where the session will be held.
 */

interface SessionRequest {
  courseName: string;
  location: Location;
}
/*TODO: ask to make sure the student Index number is a string eg:"PS/CSC/21/0001"  
  or are you making it to send the user id then you query the student table to find the index number?
  it better if you don't query the db many times, i can just send the index number and then you add it to the response and then i can display it for the lecturer
*/
/**
 * Request payload for marking attendance.
 * @property sessionId - The ID of the session.
 * @property location - The location of the student during attendance marking.
 * @property studentId - (Optional) The index number of the student (e.g., "PS/CSC/21/0001").
 */

interface AttendanceRequest {
  sessionId: number;
  location: Location;
}

/**
 * Represents a session for a course.
 * @property id - The unique identifier for the session.
 * @property status - The current status of the session ('ACTIVE' or 'CLOSED').
 * @property startTime - The start time of the session (ISO string).
 * @property endTime - The end time of the session (ISO string).
 * @property location - The location where the session is held.
 * @property lecturer - The lecturer conducting the session.
 * @property course - The course associated with the session.
 * @property attendance - The attendance record for the session.
 */
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

/**
 * Represents a geographical location.
 * @property latitude - The latitude coordinate.
 * @property longitude - The longitude coordinate.
 */
interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Represents a lecturer in the system.
 * @property username - The username of the lecturer.
 * @property firstName - The first name of the lecturer.
 * @property lastName - The last name of the lecturer.
 * @property email - The email address of the lecturer.
 * @property role - The role of the user (typically 'LECTURER').
 * @property department - The department the lecturer belongs to.
 * @property id - The unique identifier for the lecturer.
 * @property lecturerId - The lecturer's specific ID.
 * @property name - The full name of the lecturer.
 * @property courses - The list of courses assigned to the lecturer.
 * @property sessions - The list of sessions conducted by the lecturer.
 * @property attendance - The attendance records associated with the lecturer.
 * @property location - (Optional) The current location of the lecturer.
 */

interface Lecturer {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'LECTURER' | string;
  department: Department;
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

/**
 * Represents a student in the system.
 * @property username - The username of the student.
 * @property firstName - The first name of the student.
 * @property lastName - The last name of the student.
 * @property program - The academic program the student is enrolled in.
 * @property IndexNumber - The unique index number of the student (e.g., "PS/CSC/21/0001").
 * @property email - The email address of the student.
 * @property role - The role of the user (typically 'STUDENT').
 */

interface Student {
  username: string;
  firstName: string;
  lastName: string;
  program: string;
  IndexNumber: string;
  email: string;
  role: 'STUDENT' | string;
}
/**
 * Represents an attendance record for a session.
 * @property courseName - The name of the course.
 * @property date - The date of the session (ISO string).
 * @property time - The time of the session.
 * @property lecturer - The name of the lecturer.
 * @property studentList - The list of students who attended the session.
 */

interface Attendance {
  courseName: string;
  date: string;
  time: string;
  lecturer: string;
  studentList: Student[];
}

/**
 * Represents the state and actions for API data management.
 * @property courses - The list of courses.
 * @property sessions - The list of sessions.
 * @property attendance - The list of attendance records.
 * @property users - The list of users.
 * @property isLoading - Indicates if an API request is in progress.
 * @property error - The error message, if any.
 * @property fetchCourses - Fetches the list of courses.
 * @property addCourse - Adds a new course.
 * @property fetchSessions - Fetches the list of sessions.
 * @property createSession - Creates a new session.
 * @property fetchAttendance - Fetches attendance records.
 * @property markAttendance - Marks attendance for a session.
 * @property fetchUserProfile - Fetches the profile of the current user.
 * @property fetchUsers - Fetches the list of users.
 * @property updateUser - Updates user information.
 * @property deleteUser - Deletes a user by ID.
 * @property clearError - Clears the current error state.
 */
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
  fetchSingleAttendance: (attendanceId: number) => Promise<Attendance | undefined>;
  markAttendance: (attendanceReq: AttendanceRequest) => Promise<boolean | undefined>;

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
  Department,
  departmentName,
  Lecturer,
  Location,
  Session,
  SessionRequest,
  Student,
};
