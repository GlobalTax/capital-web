import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundaryProvider from '@/components/ErrorBoundaryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { LeadTrackingProvider } from '@/components/LeadTrackingProvider';
import { TrackingInitializer } from '@/components/TrackingInitializer';
import { ConsoleNoiseFilter } from '@/core/providers/ConsoleNoiseFilter';

// ============= CONDITIONAL TRACKING =============
// Solo cargar tracking fuera de rutas /admin/*
const ConditionalTracking: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <LeadTrackingProvider>
      <TrackingInitializer />
      {children}
    </LeadTrackingProvider>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: any) => {
        // No reintentar errores de autenticación/autorización
        if (error?.status === 401 || error?.code === 'PGRST301') {
          return false;
        }
        if (error?.status === 403 || error?.code === 'PGRST116') {
          return false;
        }
        if (error?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ConsoleNoiseFilter>
      <ErrorBoundaryProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router>
              <AuthProvider>
                <ConditionalTracking>
                  {children}
                </ConditionalTracking>
              </AuthProvider>
            </Router>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundaryProvider>
    </ConsoleNoiseFilter>
  );
};