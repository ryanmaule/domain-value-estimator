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
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
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
      setError(null);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (DEV_MODE) {
        setUser(data.user);
        toast.success('Logged in successfully');
      } else {
        toast.success('Check your email for the login link!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error as Error);
      toast.error('Login failed. Please try again.');
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
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