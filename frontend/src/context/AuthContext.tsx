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
  updateUser: (updatedData: Partial<User>) => void;
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
    const initAuth = async () => {
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
          return;
        } catch (e) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      // If no stored token, attempt silent session recovery via httpOnly cookie
      try {
        const response = await authApi.refreshToken();
        const { user, accessToken } = response.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setState({
          user,
          token: accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (err) {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
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

  const updateUser = (updatedData: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const newUser = { ...prev.user, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return { ...prev, user: newUser };
    });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore network failure on logout
    }
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
    <AuthContext.Provider value={{ ...state, login, register, updateUser, logout }}>
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
