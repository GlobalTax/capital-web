// ============= ENHANCED AUTH SERVICE =============
// Servicio mejorado de autenticación con gestión avanzada de sesiones

import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { devLogger } from '@/utils/devLogger';

export interface AuthSession {
  user: User;
  session: Session;
  expiresAt: Date;
  refreshToken: string;
  isValid: boolean;
}

export interface AuthAttempt {
  id: string;
  email: string;
  success: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
}

class EnhancedAuthService {
  private sessionListeners: ((session: AuthSession | null) => void)[] = [];
  private recentAttempts: AuthAttempt[] = [];
  private sessionCheckInterval: number | null = null;

  constructor() {
    this.initializeSessionMonitoring();
  }

  private initializeSessionMonitoring() {
    // Monitorear cambios de sesión
    supabase.auth.onAuthStateChange((event, session) => {
      devLogger.info(`Auth state changed: ${event}`, { 
        hasSession: !!session,
        userId: session?.user?.id 
      }, 'auth');

      if (session) {
        const authSession = this.createAuthSession(session);
        this.notifySessionListeners(authSession);
        this.startSessionValidation();
      } else {
        this.notifySessionListeners(null);
        this.stopSessionValidation();
      }
    });
  }

  private createAuthSession(session: Session): AuthSession {
    return {
      user: session.user,
      session,
      expiresAt: new Date(session.expires_at! * 1000),
      refreshToken: session.refresh_token,
      isValid: this.isSessionValid(session)
    };
  }

  private isSessionValid(session: Session): boolean {
    const now = new Date();
    const expiresAt = new Date(session.expires_at! * 1000);
    return expiresAt > now;
  }

  private startSessionValidation() {
    if (this.sessionCheckInterval) return;

    this.sessionCheckInterval = window.setInterval(async () => {
      await this.validateCurrentSession();
    }, 60000); // Check every minute
  }

  private stopSessionValidation() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  private async validateCurrentSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        devLogger.warn('Session validation failed', { error: error?.message }, 'auth');
        return false;
      }

      if (!this.isSessionValid(session)) {
        devLogger.info('Session expired, attempting refresh', undefined, 'auth');
        return await this.refreshSession();
      }

      return true;
    } catch (error) {
      devLogger.error('Session validation error', error as Error, 'auth');
      return false;
    }
  }

  private async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        devLogger.warn('Session refresh failed', { error: error?.message }, 'auth');
        return false;
      }

      devLogger.info('Session refreshed successfully', undefined, 'auth');
      return true;
    } catch (error) {
      devLogger.error('Session refresh error', error as Error, 'auth');
      return false;
    }
  }

  private notifySessionListeners(session: AuthSession | null) {
    this.sessionListeners.forEach(listener => {
      try {
        listener(session);
      } catch (error) {
        devLogger.error('Session listener error', error as Error, 'auth');
      }
    });
  }

  private logAuthAttempt(email: string, success: boolean, failureReason?: string) {
    const attempt: AuthAttempt = {
      id: crypto.randomUUID(),
      email,
      success,
      timestamp: new Date(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      failureReason
    };

    this.recentAttempts.unshift(attempt);
    // Keep only last 50 attempts
    this.recentAttempts = this.recentAttempts.slice(0, 50);

    devLogger.info('Auth attempt logged', { 
      success, 
      email: email.substring(0, 3) + '***',
      failureReason 
    }, 'auth');
  }

  private getClientIP(): string {
    // En un entorno real, esto vendría del servidor
    return 'client-ip';
  }

  // Public methods
  async signIn(email: string, password: string): Promise<{ 
    success: boolean; 
    error?: string; 
    session?: AuthSession 
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.logAuthAttempt(email, false, error.message);
        return { success: false, error: error.message };
      }

      if (data.session) {
        this.logAuthAttempt(email, true);
        const authSession = this.createAuthSession(data.session);
        return { success: true, session: authSession };
      }

      return { success: false, error: 'No session created' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logAuthAttempt(email, false, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async signUp(email: string, password: string): Promise<{ 
    success: boolean; 
    error?: string; 
    requiresConfirmation?: boolean 
  }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        this.logAuthAttempt(email, false, error.message);
        return { success: false, error: error.message };
      }

      this.logAuthAttempt(email, true);
      return { 
        success: true, 
        requiresConfirmation: !data.session 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logAuthAttempt(email, false, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.stopSessionValidation();
      devLogger.info('User signed out successfully', undefined, 'auth');
    } catch (error) {
      devLogger.error('Sign out error', error as Error, 'auth');
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return null;
      }

      return this.createAuthSession(session);
    } catch (error) {
      devLogger.error('Get current session error', error as Error, 'auth');
      return null;
    }
  }

  onSessionChange(listener: (session: AuthSession | null) => void): () => void {
    this.sessionListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.sessionListeners.indexOf(listener);
      if (index > -1) {
        this.sessionListeners.splice(index, 1);
      }
    };
  }

  getRecentAttempts(limit = 10): AuthAttempt[] {
    return this.recentAttempts.slice(0, limit);
  }

  getFailedAttempts(timeWindow = 15 * 60 * 1000): AuthAttempt[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return this.recentAttempts.filter(
      attempt => !attempt.success && attempt.timestamp > cutoff
    );
  }

  isRateLimited(email: string, maxAttempts = 5, timeWindow = 15 * 60 * 1000): boolean {
    const cutoff = new Date(Date.now() - timeWindow);
    const recentFailures = this.recentAttempts.filter(
      attempt => 
        attempt.email === email && 
        !attempt.success && 
        attempt.timestamp > cutoff
    );
    
    return recentFailures.length >= maxAttempts;
  }

  destroy() {
    this.stopSessionValidation();
    this.sessionListeners = [];
  }
}

export const enhancedAuthService = new EnhancedAuthService();
