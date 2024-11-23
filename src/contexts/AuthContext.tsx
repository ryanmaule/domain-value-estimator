import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getServiceFactory } from '../services/core/ServiceFactory';
import type { User } from '../services/core/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  searchesRemaining: number;
  decrementSearches: () => void;
  login: (email: string) => Promise<{ user?: User; magicLinkSent?: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DAILY_SEARCH_LIMIT = 5;
const BYPASS_SEARCH_LIMIT = import.meta.env.VITE_BYPASS_SEARCH_LIMIT === 'true';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchesRemaining, setSearchesRemaining] = useState(DAILY_SEARCH_LIMIT);

  useEffect(() => {
    const stored = localStorage.getItem('searchesRemaining');
    if (stored) {
      setSearchesRemaining(parseInt(stored, 10));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      verifyMagicLink(token);
    } else {
      checkSession();
    }
  }, []);

  const verifyMagicLink = async (token: string) => {
    try {
      setError(null);
      const authService = getServiceFactory().createAuthService();
      const verifiedUser = await authService.verifyMagicLink(token);
      
      if (verifiedUser) {
        setUser(verifiedUser);
        toast.success('Successfully logged in');
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        throw new Error('Invalid magic link');
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Verification failed'));
      toast.error('Invalid or expired login link');
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      setError(null);
      const authService = getServiceFactory().createAuthService();
      const currentUser = await authService.verifySession();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

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

  const login = async (email: string): Promise<{ user?: User; magicLinkSent?: boolean }> => {
    try {
      setError(null);
      const authService = getServiceFactory().createAuthService();
      return await authService.login(email);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Login failed'));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      const authService = getServiceFactory().createAuthService();
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
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