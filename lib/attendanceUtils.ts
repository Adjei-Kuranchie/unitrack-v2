import { Attendance, Student } from '~/types/app';
import { User } from '~/types/auth';

/**
 * Checks if a student was present in a specific attendance record
 * @param attendance - The attendance record to check
 * @param student - The student to check for (can be User or Student type)
 * @returns boolean indicating if the student was present
 */
export const isStudentPresent = (attendance: Attendance, student: User | Student): boolean => {
  if (!attendance.studentList || attendance.studentList.length === 0) {
    return false;
  }

  // Check by username first (most reliable)
  if (student.username) {
    return attendance.studentList.some((s) => s.username === student.username);
  }

  // Fallback to email check
  if (student.email) {
    return attendance.studentList.some((s) => s.email === student.email);
  }

  // For students with IndexNumber, check that too
  if ('IndexNumber' in student && student.IndexNumber) {
    return attendance.studentList.some((s) => s.IndexNumber === student.IndexNumber);
  }

  return false;
};

/**
 * Gets the attendance status for a student across all attendance records
 * @param attendanceRecords - Array of attendance records
 * @param student - The student to check
 * @returns Object with attendance statistics
 */
export const getStudentAttendanceStats = (
  attendanceRecords: Attendance[],
  student: User | Student
) => {
  const totalSessions = attendanceRecords.length;
  const attendedSessions = attendanceRecords.filter((record) =>
    isStudentPresent(record, student)
  ).length;
  const missedSessions = totalSessions - attendedSessions;
  const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

  return {
    totalSessions,
    attendedSessions,
    missedSessions,
    attendanceRate: Math.round(attendanceRate * 100) / 100, // Round to 2 decimal places
  };
};

/**
 * Updates the attendance status display based on student presence
 * @param attendance - The attendance record
 * @param student - The current student
 * @returns Object with display properties for the attendance status
 */
export const getAttendanceStatusDisplay = (attendance: Attendance, student: User | Student) => {
  const isPresent = isStudentPresent(attendance, student);

  return {
    isPresent,
    badgeColor: isPresent ? 'bg-green-100' : 'bg-red-100',
    textColor: isPresent ? 'text-green-600' : 'text-red-600',
    iconName: isPresent ? 'check-circle' : 'cancel',
    iconColor: isPresent ? '#10b981' : '#ef4444',
    statusText: isPresent ? 'Present' : 'Absent',
    statusBarColor: isPresent ? 'bg-green-500' : 'bg-red-500',
  };
};

/**
 * Filters attendance records to show only sessions where the student was present
 * @param attendanceRecords - Array of attendance records
 * @param student - The student to filter for
 * @returns Array of attendance records where the student was present
 */
export const getStudentPresentSessions = (
  attendanceRecords: Attendance[],
  student: User | Student
): Attendance[] => {
  return attendanceRecords.filter((record) => isStudentPresent(record, student));
};

/**
 * Filters attendance records to show only sessions where the student was absent
 * @param attendanceRecords - Array of attendance records
 * @param student - The student to filter for
 * @returns Array of attendance records where the student was absent
 */
export const getStudentAbsentSessions = (
  attendanceRecords: Attendance[],
  student: User | Student
): Attendance[] => {
  return attendanceRecords.filter((record) => !isStudentPresent(record, student));
};
