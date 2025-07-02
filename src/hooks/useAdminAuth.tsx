
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';
import { DatabaseError, AuthenticationError } from '@/types/errorTypes';

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        logger.error('Failed to check session', error as Error, { context: 'auth', component: 'useAdminAuth' });
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed', { event }, { context: 'auth', component: 'useAdminAuth' });
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        const dbError = new DatabaseError('Failed to check admin status', 'SELECT', { userId, error: error.message });
        logger.error('Admin status check failed', dbError, { context: 'auth', component: 'useAdminAuth' });
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    } catch (error) {
      logger.error('Admin status check error', error as Error, { context: 'auth', component: 'useAdminAuth', userId });
      setIsAdmin(false);
    }
  };

  return { user, isLoading, isAdmin };
};
