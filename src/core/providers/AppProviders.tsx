import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundaryProvider from '@/components/ErrorBoundaryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { LeadTrackingProvider } from '@/components/LeadTrackingProvider';
import { TrackingInitializer } from '@/components/TrackingInitializer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: any) => {
        // No reintentar errores de red específicos
        if (error?.status === 404 || error?.status === 403) return false;
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
    <ErrorBoundaryProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <AuthProvider>
              <LeadTrackingProvider>
                <TrackingInitializer />
                {children}
              </LeadTrackingProvider>
            </AuthProvider>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundaryProvider>
  );
};