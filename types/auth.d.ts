interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'LECTURER' | 'STUDENT' | 'ADMIN';
  program?: string; // Optional for lecturers/admins
  IndexNumber?: string; // Optional for students
}

interface AuthState {
  user: User | null;
  role: User.role | null; // User role for access control
  resMessage: boolean | null; // Response message for registration or other actions
  token: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  setUser: (user: any) => void;
  register: (userData: RegisterData) => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'LECTURER' | 'STUDENT' | 'ADMIN';
}

export type { AuthState, RegisterData };
