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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DAILY_SEARCH_LIMIT = 5;
const BYPASS_SEARCH_LIMIT = import.meta.env.VITE_BYPASS_SEARCH_LIMIT === 'true';
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.MODE === 'development';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchesRemaining, setSearchesRemaining] = useState(DAILY_SEARCH_LIMIT);

  // Initialize searches remaining from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('searchesRemaining');
    if (stored) {
      setSearchesRemaining(parseInt(stored, 10));
    }
  }, []);

  // Single session check on mount
  useEffect(() => {
    async function initializeSession() {
      try {
        if (DEV_MODE) {
          setUser({
            id: 'dev-user',
            email: 'dev@example.com',
            displayName: 'Dev User',
            isPro: true
          });
          setLoading(false);
          return;
        }

        const response = await fetch('/api/user', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initializeSession();
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
      
      if (DEV_MODE) {
        setUser({
          id: 'dev-user',
          email,
          displayName: 'Dev User',
          isPro: true
        });
        toast.success('Logged in successfully');
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        toast.success('Logged in successfully');
      } else if (data.magicLink) {
        toast.success('Check your email for the login link!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error : new Error('Login failed'));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      
      if (DEV_MODE) {
        setUser(null);
        toast.success('Logged out successfully');
        return;
      }

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error : new Error('Logout failed'));
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
    logout
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