interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'LECTURER' | 'STUDENT';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  register: (userData: RegisterData) => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'LECTURER' | 'STUDENT';
}

export { AuthState, RegisterData };
