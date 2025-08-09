import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LeadTrackingProvider } from '@/components/LeadTrackingProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Router>
          <LeadTrackingProvider enabled={true}>
            {children}
          </LeadTrackingProvider>
          <Toaster />
        </Router>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default AppProviders;
