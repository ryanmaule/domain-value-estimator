import type { ServiceFactory, AuthService, StorageService, AnalyticsService } from '../core/types';
import WebContainerAuthService from './WebContainerAuthService';
import WebContainerStorageService from './WebContainerStorageService';
import WebContainerAnalyticsService from './WebContainerAnalyticsService';

export default class WebContainerServiceFactory implements ServiceFactory {
  private static instance: WebContainerServiceFactory;
  private authService?: AuthService;
  private storageService?: StorageService;
  private analyticsService?: AnalyticsService;

  private constructor() {}

  static getInstance(): WebContainerServiceFactory {
    if (!WebContainerServiceFactory.instance) {
      WebContainerServiceFactory.instance = new WebContainerServiceFactory();
    }
    return WebContainerServiceFactory.instance;
  }

  createAuthService(): AuthService {
    if (!this.authService) {
      this.authService = new WebContainerAuthService();
    }
    return this.authService;
  }

  createStorageService(): StorageService {
    if (!this.storageService) {
      this.storageService = new WebContainerStorageService();
    }
    return this.storageService;
  }

  createAnalyticsService(): AnalyticsService {
    if (!this.analyticsService) {
      this.analyticsService = new WebContainerAnalyticsService();
    }
    return this.analyticsService;
  }
}