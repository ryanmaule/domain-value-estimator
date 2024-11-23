import type { AuthService, User } from '../core/types';

export default class WebContainerAuthService implements AuthService {
  async login(email: string): Promise<{ user?: User; magicLinkSent?: boolean }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Log magic link in WebContainer
      if (data.magicLink) {
        console.log('\n🔐 Magic Link:', data.magicLink);
        console.log('Click this link to complete login\n');
      }

      return { magicLinkSent: true };
    } catch (error) {
      console.error('WebContainer login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('WebContainer logout error:', error);
      throw error;
    }
  }

  async verifySession(): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      });

      const data = await response.json();
      return data.success ? data.user : null;
    } catch (error) {
      console.error('WebContainer session verification error:', error);
      return null;
    }
  }

  async verifyMagicLink(token: string): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        credentials: 'include'
      });

      const data = await response.json();
      return data.success && data.user ? data.user : null;
    } catch (error) {
      console.error('WebContainer magic link verification error:', error);
      return null;
    }
  }
}