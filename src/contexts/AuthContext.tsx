import React, { createContext, useContext, useState } from 'react';
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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DAILY_SEARCH_LIMIT = 5;
const BYPASS_SEARCH_LIMIT = import.meta.env.VITE_BYPASS_SEARCH_LIMIT === 'true';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchesRemaining, setSearchesRemaining] = useState(DAILY_SEARCH_LIMIT);

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

  const logout = async () => {
    try {
      setError(null);
      setUser(null);
      localStorage.removeItem('user');
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
    logout
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