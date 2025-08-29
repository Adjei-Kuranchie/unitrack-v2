/**
 * Represents a user in the authentication system.
 * @property {number} id - Unique identifier for the user.
 * @property {string} username - Username for login.
 * @property {string} firstName - User's first name.
 * @property {string} lastName - User's last name.
 * @property {string} email - User's email address.
 * @property {'LECTURER' | 'STUDENT' | 'ADMIN'} role - Role assigned to the user.
 * @property {string} [program] - Program name, optional for lecturers/admins.
 * @property {string} [IndexNumber] - Index number, optional for students.
 */

import { departmentName } from './app';

/**
 * Represents the authentication state and actions.
 * @property {User | null} user - The currently authenticated user, or null if not authenticated.
 * @property {User.role | null} role - The role of the current user for access control.
 * @property {boolean | null} resMessage - Response message for registration or other actions.
 * @property {string | null} token - Authentication token, if available.
 * @property {boolean} isLoading - Indicates if an authentication request is in progress.
 * @property {string | null} error - Error message, if any.
 * @property {(username: string, password: string) => Promise<void>} signIn - Function to sign in a user.
 * @property {() => void} signOut - Function to sign out the current user.
 * @property {(user: any) => void} setUser - Function to set the current user.
 * @property {(userData: RegisterData) => Promise<void>} register - Function to register a new user.
 * @property {() => void} clearError - Function to clear the error state.
 */

/**
 * Represents the data required to register a new user.
 * @property {string} username - Desired username.
 * @property {string} password - Desired password.
 * @property {string} firstName - User's first name.
 * @property {string} lastName - User's last name.
 * @property {string} email - User's email address.
 * @property {'LECTURER' | 'STUDENT' | 'ADMIN'} role - Role assigned to the user.
 */
interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'LECTURER' | 'STUDENT' | 'ADMIN';
  program?: string; // Optional for lecturers/admins
  IndexNumber?: string; // Optional for students
  department: departmentName;
}

interface AuthState {
  user: User | null;
  role: User.role | null; // User role for access control
  resMessage: boolean | null; // Response message for registration or other actions
  token: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  setUser: (user: any) => void;
  register: (userData: RegisterData) => Promise<void>;
  forgotPassword : (email:string) => Promise<boolean>;
  clearError: () => void;
}

interface RegisterData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  department: departmentName;
  role: 'LECTURER' | 'STUDENT' | 'ADMIN';
}

export type { AuthState, RegisterData, User };
