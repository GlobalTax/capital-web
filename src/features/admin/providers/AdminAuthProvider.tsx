// ============= ADMIN AUTH PROVIDER =============
// Specialized admin authentication and permissions

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/shared/auth/AuthProvider';
import { logger } from '@/utils/logger';

interface RegistrationRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  rejection_reason?: string;
}

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  registrationRequest: RegistrationRequest | null;
  isApproved: boolean;
  checkAdminStatus: (userId?: string) => Promise<boolean>;
  checkRegistrationStatus: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationRequest, setRegistrationRequest] = useState<RegistrationRequest | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  const checkAdminStatus = useCallback(async (userId?: string): Promise<boolean> => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      setIsAdmin(false);
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, is_active')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        logger.warn('Error checking admin status', { 
          userId: targetUserId, 
          error: error.message 
        }, { context: 'auth', component: 'AdminAuthProvider' });
        setIsAdmin(false);
        return false;
      }

      const adminStatus = !!data?.is_active;
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      logger.error('Failed to check admin status', error as Error, { 
        context: 'auth',
        component: 'AdminAuthProvider',
        userId: targetUserId 
      });
      setIsAdmin(false);
      return false;
    }
  }, [user?.id]);

  const checkRegistrationStatus = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setRegistrationRequest(null);
      setIsApproved(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_registration_requests')
        .select('id, status, requested_at, rejection_reason')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No existing request, create one
          const { error: insertError } = await supabase
            .from('user_registration_requests')
            .insert({
              user_id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email || '',
              user_agent: navigator.userAgent,
              ip_address: null
            });

          if (!insertError) {
            setRegistrationRequest({
              id: '',
              status: 'pending',
              requested_at: new Date().toISOString()
            });
          }
        }
        setIsApproved(false);
        return;
      }

      setRegistrationRequest(data as RegistrationRequest);
      setIsApproved(data.status === 'approved');
    } catch (error) {
      logger.error('Error checking registration status', error as Error, {
        context: 'auth',
        component: 'AdminAuthProvider',
        userId: user.id
      });
    }
  }, [user?.id, user?.email, user?.user_metadata]);

  useEffect(() => {
    if (user) {
      const checkStatus = async () => {
        setIsLoading(true);
        const adminStatus = await checkAdminStatus(user.id);
        
        if (!adminStatus) {
          await checkRegistrationStatus();
        } else {
          setIsApproved(true);
        }
        
        setIsLoading(false);
      };
      
      checkStatus();
    } else {
      setIsAdmin(false);
      setIsApproved(false);
      setRegistrationRequest(null);
      setIsLoading(false);
    }
  }, [user, checkAdminStatus, checkRegistrationStatus]);

  const value = {
    isAdmin,
    isLoading,
    registrationRequest,
    isApproved,
    checkAdminStatus,
    checkRegistrationStatus,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};