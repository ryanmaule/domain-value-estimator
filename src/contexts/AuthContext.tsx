import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  searchesRemaining: number;
  decrementSearches: () => void;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DAILY_SEARCH_LIMIT = 5;
const BYPASS_SEARCH_LIMIT = import.meta.env.VITE_BYPASS_SEARCH_LIMIT === 'true';
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchesRemaining, setSearchesRemaining] = useState(DAILY_SEARCH_LIMIT);

  const checkSession = async (): Promise<void> => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/user?_=${timestamp}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error('Session check failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const decrementSearches = (): void => {
    if (BYPASS_SEARCH_LIMIT || user?.isPro) {
      return;
    }
    
    if (searchesRemaining > 0) {
      const newCount = searchesRemaining - 1;
      setSearchesRemaining(newCount);
      localStorage.setItem('searchesRemaining', String(newCount));
    }
  };

  const login = async (email: string): Promise<void> => {
    try {
      setError(null);
      
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/auth/login?_=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (DEV_MODE) {
        if (data.user) {
          setUser(data.user);
          toast.success('Logged in successfully');
        } else {
          throw new Error('Dev mode login failed: Missing user data');
        }
      } else {
        if (data.magicLink) {
          toast.success('Check your email for the login link!');
        } else {
          throw new Error('Login failed: Invalid response from server');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/auth/logout?_=${timestamp}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (!response.ok) {
        throw new Error('Logout request failed');
      }

      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      toast.error('Failed to log out. Please try again.');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    searchesRemaining,
    decrementSearches,
    login,
    logout,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}