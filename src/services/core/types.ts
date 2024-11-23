// Service factory types
export interface ServiceFactory {
  createAuthService: () => AuthService;
  createStorageService: () => StorageService;
  createAnalyticsService: () => AnalyticsService;
}

// Core service interfaces
export interface AuthService {
  login(email: string): Promise<{ user?: User; magicLinkSent?: boolean }>;
  logout(): Promise<void>;
  verifySession(): Promise<User | null>;
  verifyMagicLink(token: string): Promise<User | null>;
}

export interface StorageService {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface AnalyticsService {
  trackEvent(name: string, data?: Record<string, any>): void;
  trackError(error: Error): void;
  setUser(user: User | null): void;
}

// Shared types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  isPro: boolean;
}