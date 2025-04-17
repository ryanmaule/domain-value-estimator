import type { ServiceFactory, AuthService, StorageService, AnalyticsService } from './types';

class ProdAuthService implements AuthService {
  async login(email: string): Promise<{ user?: import("./types").User | undefined; magicLinkSent?: boolean | undefined; }> {
    return {};
  }
  async logout(): Promise<void> {
    return;
  }
  async verifySession(): Promise<import("./types").User | null> {
    return null;
  }
  async verifyMagicLink(token: string): Promise<import("./types").User | null> {
    return null;
  }
}

class ProdStorageService implements StorageService {
  async get(key: string): Promise<any> {
    return undefined;
  }
  async set(key: string, value: any): Promise<void> {
    return;
  }
  async remove(key: string): Promise<void> {
    return;
  }
  async clear(): Promise<void> {
    return;
  }
}

class ProdAnalyticsService implements AnalyticsService {
  trackEvent(name: string, data?: Record<string, any>): void {
    return;
  }
  trackError(error: Error): void {
    return;
  }
  setUser(user: import("./types").User | null): void {
    return;
  }
}


class ProdServiceFactory implements ServiceFactory {
  private static instance: ProdServiceFactory;

  private constructor() {}

  public static getInstance(): ProdServiceFactory {
    if (!ProdServiceFactory.instance) {
      ProdServiceFactory.instance = new ProdServiceFactory();
    }
    return ProdServiceFactory.instance;
  }

  createAuthService(): AuthService {
    return new ProdAuthService();
  }

  createStorageService(): StorageService {
    return new ProdStorageService();
  }

  createAnalyticsService(): AnalyticsService {
    return new ProdAnalyticsService();
  }
}

export default ProdServiceFactory;