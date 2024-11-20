import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  isPro: boolean;
}

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchesRemaining, setSearchesRemaining] = useState(DAILY_SEARCH_LIMIT);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/user', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        console.error('Session check failed:', {
          status: response.status,
          statusText: response.statusText
        });
        setUser(null);
      }
    } catch (error) {
      console.error('Session check error:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const decrementSearches = () => {
    if (BYPASS_SEARCH_LIMIT || user?.isPro) {
      return;
    }
    
    if (searchesRemaining > 0) {
      const newCount = searchesRemaining - 1;
      setSearchesRemaining(newCount);
      localStorage.setItem('searchesRemaining', String(newCount));
    }
  };

  const login = async (email: string) => {
    try {
      console.log('Starting login process:', { email, devMode: DEV_MODE });
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      console.log('Login response:', {
        status: response.status,
        statusText: response.statusText
      });

      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        const error = new Error(data.message || 'Login failed');
        console.error('Login failed:', {
          status: response.status,
          data,
          error
        });
        throw error;
      }

      if (DEV_MODE) {
        console.log('Dev mode login data:', data);
        if (!data.user) {
          console.error('Dev mode login failed: No user data received');
          throw new Error('Dev mode login failed: Missing user data');
        }
        setUser(data.user);
        toast.success('Logged in successfully');
      } else {
        toast.success('Check your email for the login link!');
      }
    } catch (error) {
      console.error('Login error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        devMode: DEV_MODE
      });
      setError(error as Error);
      toast.error('Login failed. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Starting logout process');
      setError(null);
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      console.log('Logout response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        throw new Error('Logout request failed');
      }

      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setError(error as Error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  const value = {
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}