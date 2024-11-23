import type { AnalyticsService } from '../core/types';
import type { User } from '../core/types';

export default class WebContainerAnalyticsService implements AnalyticsService {
  trackEvent(name: string, data?: Record<string, any>): void {
    console.log('[Analytics Event]', name, data);
  }

  trackError(error: Error): void {
    console.error('[Analytics Error]', error);
  }

  setUser(user: User | null): void {
    console.log('[Analytics User]', user);
  }
}