import { router, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Alert, InteractionManager } from 'react-native';
import { useAuthStore } from '~/store/authStore';
import { autoLogout } from './logoutUtils';

/**
 * Formats a date string for CSV export in a clean format.
 * Example output: "2024-01-15"
 *
 * @param dateString - The date string to format.
 * @returns The formatted date string for CSV.
 */
const formatDateForCSV = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Formats a time string for CSV export in a clean format.
 * Example output: "10:30 AM"
 *
 * @param dateString - The date string to format.
 * @returns The formatted time string for CSV.
 */
const formatTimeForCSV = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats a date string for filename usage (safe characters only).
 * Example output: "2024-01-15_10-30"
 *
 * @param dateString - The date string to format.
 * @returns The formatted date string safe for filenames.
 */
const formatDateForFilename = (dateString: string) => {
  const date = new Date(dateString);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = date.toTimeString().split(' ')[0].substring(0, 5).replace(':', '-'); // HH-MM
  return `${dateStr}_${timeStr}`;
};

/**
 * Escapes CSV field values to handle commas, quotes, and newlines.
 *
 * @param field - The field value to escape.
 * @returns The escaped field value.
 */
const escapeCSVField = (field: string | number | null | undefined): string => {
  if (field === null || field === undefined) return '';

  const stringField = String(field);

  // If the field contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
};
/**
 * Formats a date string into a human-readable date and time string.
 * Example output: "Jan 1, 2024, 10:30 AM"
 *
 * @param dateString - The date string to format.
 * @returns The formatted date and time string.
 */

const formatDate = (dateString: string, includeTime: boolean = true) => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date string into a human-readable time string.
 * Example output: "10:30 AM"
 *
 * @param dateString - The date string to format.
 * @returns The formatted time string.
 */

const formatTime = (dateString: string, exportFormat?: boolean) => {
  const timeString = new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  // If you want to format the time as "1-01-1025", you can use:
  const exportString = `${new Date(dateString).getHours()}-${String(new Date(dateString).getMinutes()).padStart(2, '0')}-${String(new Date(dateString).getFullYear()).padStart(4, '0')}`;
  return exportFormat ? exportString : timeString;
};

/**
 * Formats a date string into an object containing a formatted date and time.
 * Example output: { date: "Monday, January 1, 2024", time: "10:30 AM" }
 *
 * @param dateString - The date string to format.
 * @returns An object with formatted `date` and `time` strings.
 */

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

/**
 * Checks if a given JWT token is expired.
 *
 * @param token - The JWT token string to check.
 * @returns `true` if the token is expired or invalid, otherwise `false`.
 */
const isJWTExpired = (token: string | null): boolean => {
  try {
    if (!token) {
      return true;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    if (!payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking JWT expiration:', error);
    return true;
  }
};

/**
 * Logs out the user by clearing authentication state with proper cleanup.
 * Uses InteractionManager to ensure smooth transitions.
 */
const logoutAndRedirect = () => {
  // Clear auth state immediately
  useAuthStore.setState({
    token: null,
    user: null,
    role: null,
    resMessage: null,
    error: 'Session expired. Please log in again.',
  });

  // Use InteractionManager to ensure all interactions are complete before navigating
  InteractionManager.runAfterInteractions(() => {
    // Add a small delay to ensure state updates are processed
    setTimeout(() => {
      try {
        // Use push instead of replace to avoid potential navigation conflicts
        router.push('/screens/(auth)/RegisterScreen');
      } catch (error) {
        console.error('Logout navigation error:', error);
        // Fallback: try with replace after a longer delay
        setTimeout(() => {
          try {
            router.replace('/screens/(auth)/RegisterScreen');
          } catch (fallbackError) {
            console.error('Fallback logout navigation error:', fallbackError);
          }
        }, 500);
      }
    }, 100);
  });
};

/**
 * React hook that watches a JWT token and logs out the user if the token expires.
 */
const useTokenWatcher = (token: string | null) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only set up watcher if we have a token
    if (token) {
      // Check immediately if token is expired
      if (isJWTExpired(token)) {
        // Only logout if this is a different token or first check
        if (lastTokenRef.current !== token) {
          autoLogout();
        }
      } else {
        // Set up periodic checking for valid tokens
        intervalRef.current = setInterval(
          () => {
            if (token && isJWTExpired(token)) {
              autoLogout();
            }
          },
          1000 * 60 * 5
        ); // Check every 5 minutes (reduced from 10)
      }
    }

    // Update last token reference
    lastTokenRef.current = token;

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [token]);
};

const useLogout = () => {
  const router = useRouter();
  const isLoggingOut = useRef(false);

  const logout = useCallback(async () => {
    // Prevent multiple logout attempts
    if (isLoggingOut.current) {
      return;
    }

    isLoggingOut.current = true;

    try {
      // Clear auth state
      useAuthStore.setState({
        token: null,
        user: null,
        role: null,
        resMessage: null,
        error: null,
      });

      // Wait for all interactions to complete
      await new Promise((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          resolve(void 0);
        });
      });

      // Additional delay to ensure state is cleared
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Navigate to auth screen
      router.replace('/screens/(auth)/RegisterScreen');
    } catch (error) {
      console.error('Logout error:', error);

      // Show error alert and try fallback navigation
      Alert.alert('Logout Error', 'There was an issue logging out. The app will restart.', [
        {
          text: 'OK',
          onPress: () => {
            // Force navigation after user acknowledges
            setTimeout(() => {
              try {
                router.replace('/screens/(auth)/RegisterScreen');
              } catch (fallbackError) {
                console.error('Fallback logout error:', fallbackError);
                // Last resort: reload the app
                // You might need to implement app reload based on your setup
              }
            }, 100);
          },
        },
      ]);
    } finally {
      // Reset the flag after a delay
      setTimeout(() => {
        isLoggingOut.current = false;
      }, 2000);
    }
  }, [router]);

  return { logout, isLoggingOut: isLoggingOut.current };
};

/**
 * Checks if a student was present in a given session based on the student list
 * @param studentList - Array of students who were present in the session
 * @param studentId - ID of the student to check for presence
 * @param studentName - Optional: Name of the student to check for presence
 * @returns Object containing presence status and additional info
 */
const checkStudentPresence = (
  studentList: string[] | number[] | { id: string | number; name: string }[],
  studentId: string | number,
  studentName?: string
): {
  isPresent: boolean;
  matchType: 'id' | 'name' | 'both' | 'none';
  foundStudent?: any;
} => {
  if (!studentList || studentList.length === 0) {
    return { isPresent: false, matchType: 'none' };
  }

  // Handle array of primitive values (IDs or names)
  if (typeof studentList[0] === 'string' || typeof studentList[0] === 'number') {
    const primitiveList = studentList as (string | number)[];

    // Check by ID first
    if (primitiveList.includes(studentId)) {
      return { isPresent: true, matchType: 'id', foundStudent: studentId };
    }

    // Check by name if provided
    if (studentName && primitiveList.includes(studentName)) {
      return { isPresent: true, matchType: 'name', foundStudent: studentName };
    }

    return { isPresent: false, matchType: 'none' };
  }

  // Handle array of objects with id and name properties
  if (typeof studentList[0] === 'object' && studentList[0] !== null) {
    const objectList = studentList as { id: string | number; name: string }[];

    const foundStudent = objectList.find((student) => {
      const idMatch = student.id === studentId;
      const nameMatch = studentName ? student.name === studentName : false;

      return idMatch || nameMatch;
    });

    if (foundStudent) {
      const idMatch = foundStudent.id === studentId;
      const nameMatch = studentName ? foundStudent.name === studentName : false;

      let matchType: 'id' | 'name' | 'both' = 'id';
      if (idMatch && nameMatch) matchType = 'both';
      else if (nameMatch) matchType = 'name';

      return { isPresent: true, matchType, foundStudent };
    }
  }

  return { isPresent: false, matchType: 'none' };
};

/**
 * Checks if multiple students were present in a session
 * @param studentList - Array of students who were present in the session
 * @param studentsToCheck - Array of students to check for presence
 * @returns Array of results for each student checked
 */
const checkMultipleStudentsPresence = (
  studentList: string[] | number[] | { id: string | number; name: string }[],
  studentsToCheck: { id: string | number; name?: string }[]
): Array<{
  studentId: string | number;
  studentName?: string;
  isPresent: boolean;
  matchType: 'id' | 'name' | 'both' | 'none';
  foundStudent?: any;
}> => {
  return studentsToCheck.map((student) => ({
    studentId: student.id,
    studentName: student.name,
    ...checkStudentPresence(studentList, student.id, student.name),
  }));
};

/**
 * Gets attendance statistics for a list of students
 * @param studentList - Array of students who were present in the session
 * @param totalExpectedStudents - Total number of students expected to attend
 * @returns Attendance statistics
 */
const getAttendanceStats = (
  studentList: string[] | number[] | { id: string | number; name: string }[],
  totalExpectedStudents: number
): {
  totalPresent: number;
  totalAbsent: number;
  attendanceRate: number;
  attendancePercentage: string;
} => {
  const totalPresent = studentList.length;
  const totalAbsent = totalExpectedStudents - totalPresent;
  const attendanceRate = totalExpectedStudents > 0 ? totalPresent / totalExpectedStudents : 0;
  const attendancePercentage = (attendanceRate * 100).toFixed(1);

  return {
    totalPresent,
    totalAbsent,
    attendanceRate,
    attendancePercentage,
  };
};

/**
 * Filters attendance records to show only sessions where a specific student was present
 * @param attendanceRecords - Array of attendance records
 * @param studentId - ID of the student to filter by
 * @param studentName - Optional: Name of the student to filter by
 * @returns Filtered attendance records where the student was present
 */
const filterAttendanceByStudent = (
  attendanceRecords: Array<{
    id: string | number;
    date: string;
    courseName: string;
    studentList: string[] | number[] | { id: string | number; name: string }[];
    [key: string]: any;
  }>,
  studentId: string | number,
  studentName?: string
): Array<{
  id: string | number;
  date: string;
  courseName: string;
  studentList: string[] | number[] | { id: string | number; name: string }[];
  [key: string]: any;
}> => {
  return attendanceRecords.filter((record) => {
    const { isPresent } = checkStudentPresence(record.studentList, studentId, studentName);
    return isPresent;
  });
};

export {
  escapeCSVField,
  formatDate,
  formatDateForCSV,
  formatDateForFilename,
  formatDateTime,
  formatTime,
  formatTimeForCSV,
  isJWTExpired,
  useTokenWatcher,
  logoutAndRedirect,
  useLogout,
  checkStudentPresence,
  checkMultipleStudentsPresence,
  getAttendanceStats,
  filterAttendanceByStudent,
};
