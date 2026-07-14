import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // Start in a loading state until we check localStorage
  });

  useEffect(() => {
    // Check for token on mount
    const storedToken = localStorage.getItem('token');
    const storedUserStr = localStorage.getItem('user');

    if (storedToken && storedUserStr) {
      try {
        const user = JSON.parse(storedUserStr);
        setState({
          user,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (e) {
        // If JSON parse fails, clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password?: string) => {
    const response = await authApi.login(email, password);
    const { user, accessToken } = response.data;

    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    setState({
      user,
      token: accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (name: string, email: string, password?: string) => {
    const response = await authApi.register(name, email, password);
    const { user, accessToken } = response.data;

    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    setState({
      user,
      token: accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
