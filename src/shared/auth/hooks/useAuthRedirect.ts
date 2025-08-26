// ============= AUTH REDIRECT HOOK =============
// Centralized auth redirection logic

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';

interface UseAuthRedirectOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  redirectUnauthenticated?: string;
}

export const useAuthRedirect = ({
  requireAuth = false,
  redirectTo = '/admin',
  redirectUnauthenticated = '/auth'
}: UseAuthRedirectOptions = {}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !user) {
      navigate(redirectUnauthenticated, { replace: true });
    } else if (!requireAuth && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, isLoading, requireAuth, redirectTo, redirectUnauthenticated, navigate]);

  return { user, isLoading };
};