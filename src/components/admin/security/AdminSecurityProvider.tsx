import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'permission_denied' | 'suspicious_activity' | 'role_change';
  userId?: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AdminSecurityContextType {
  isSecureSession: boolean;
  sessionExpiry: Date | null;
  recentEvents: SecurityEvent[];
  logSecurityEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
  requireElevatedPermissions: (action: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
}

const AdminSecurityContext = createContext<AdminSecurityContextType | undefined>(undefined);

export const AdminSecurityProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const { userRole, hasPermission } = useRoleBasedPermissions();
  const [isSecureSession, setIsSecureSession] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    if (session) {
      validateSession();
      const interval = setInterval(validateSession, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [session]);

  const validateSession = async () => {
    if (!session) {
      setIsSecureSession(false);
      setSessionExpiry(null);
      return;
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setIsSecureSession(false);
        logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          details: { reason: 'Invalid session detected', error: error?.message }
        });
        return;
      }

      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();

      if (timeUntilExpiry <= 0) {
        setIsSecureSession(false);
        logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          details: { reason: 'Expired session' }
        });
        return;
      }

      setIsSecureSession(true);
      setSessionExpiry(expiresAt);

      // Log if session is about to expire (15 minutes)
      if (timeUntilExpiry <= 15 * 60 * 1000) {
        logSecurityEvent({
          type: 'login_attempt',
          severity: 'low',
          details: { reason: 'Session expiring soon', expiresIn: Math.round(timeUntilExpiry / 60000) }
        });
      }
    } catch (error) {
      logger.error('Session validation failed', error as Error, { context: 'auth' });
      setIsSecureSession(false);
    }
  };

  const logSecurityEvent = (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    const newEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      userId: user?.id
    };

    setRecentEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events

    // Log critical events
    if (event.severity === 'critical' || event.severity === 'high') {
      logger.warn('Security event', newEvent, { context: 'auth' });
    }

    // Send to monitoring endpoint if available
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/security-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      }).catch(() => {}); // Silent fail
    }
  };

  const requireElevatedPermissions = async (action: string): Promise<boolean> => {
    if (!hasPermission('canManageUsers' as any)) {
      logSecurityEvent({
        type: 'permission_denied',
        severity: 'medium',
        details: { action, userRole, reason: 'Insufficient permissions' }
      });
      return false;
    }

    // For super sensitive actions, require re-authentication
    const sensitiveActions = ['delete_user', 'change_super_admin', 'system_config'];
    if (sensitiveActions.includes(action)) {
      // In a real app, this would trigger a re-auth dialog
      logSecurityEvent({
        type: 'permission_denied',
        severity: 'high',
        details: { action, reason: 'Sensitive action requires re-authentication' }
      });
      return confirm('Esta acción requiere confirmación adicional. ¿Continuar?');
    }

    return true;
  };

  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (!error) {
        await validateSession();
        logSecurityEvent({
          type: 'login_attempt',
          severity: 'low',
          details: { action: 'session_refreshed' }
        });
      }
    } catch (error) {
      logger.error('Session refresh failed', error as Error, { context: 'auth' });
    }
  };

  const value = {
    isSecureSession,
    sessionExpiry,
    recentEvents,
    logSecurityEvent,
    requireElevatedPermissions,
    refreshSession
  };

  return (
    <AdminSecurityContext.Provider value={value}>
      {children}
    </AdminSecurityContext.Provider>
  );
};

export const useAdminSecurity = () => {
  const context = useContext(AdminSecurityContext);
  if (!context) {
    throw new Error('useAdminSecurity must be used within AdminSecurityProvider');
  }
  return context;
};