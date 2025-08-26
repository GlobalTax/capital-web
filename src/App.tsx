
import React from 'react';
import ErrorBoundaryProvider from '@/components/ErrorBoundaryProvider';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppLayout } from '@/app/layout/AppLayout';
import { AppRoutes } from '@/app/routes/AppRoutes';

// Simplified App component - logic moved to separate modules

function App() {
  return (
    <ErrorBoundaryProvider>
      <AppProviders>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </AppProviders>
    </ErrorBoundaryProvider>
  );
}

export default App;
