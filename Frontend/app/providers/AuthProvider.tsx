import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authApi, type User } from '../features/auth/services/auth.api';
import toast from 'react-hot-toast';

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: 'AUTH_START' });
        const { user } = await authApi.getProfile();
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error: any) {
        dispatch({ type: 'AUTH_ERROR', payload: 'Not authenticated' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { user } = await authApi.login({ email, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      toast.error(error.message);
      return false;
    }
  };

  // Signup function
  const signup = async (userData: any): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { user } = await authApi.signup(userData);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      toast.success('Account created successfully!');
      return true;
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      toast.error(error.message);
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      dispatch({ type: 'LOGOUT' });
      toast.error('Logout failed, but you have been logged out locally');
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
