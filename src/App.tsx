
// ============= APP ENTRY POINT =============
// Main application entry with optimized architecture

import React, { useEffect } from 'react';
import ErrorBoundaryProvider from '@/components/ErrorBoundaryProvider';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppLayout } from '@/app/layout/AppLayout';
import { AppRoutes } from '@/app/routes/AppRoutes';
import { globalCleanup } from '@/utils/cleanup';
import { logger } from '@/utils/logger';

function App() {
  useEffect(() => {
    // Initialize app
    logger.info('Capittal app initialized', undefined, {
      context: 'system',
      component: 'App'
    });

    // Setup global cleanup
    const handleBeforeUnload = () => {
      globalCleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      globalCleanup();
    };
  }, []);

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
