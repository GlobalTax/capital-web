// ============= APP PROVIDERS =============
// Centralized provider composition with performance optimization

import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/shared/auth/AuthProvider';
import { AdminAuthProvider } from '@/features/admin/providers/AdminAuthProvider';
import { LeadTrackingProvider } from '@/components/LeadTrackingProvider';
import { PerformanceProvider } from './PerformanceProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <PerformanceProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Router>
              <LeadTrackingProvider enabled={true}>
                {children}
                <Toaster />
              </LeadTrackingProvider>
            </Router>
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </PerformanceProvider>
  );
};