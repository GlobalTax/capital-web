// ============= DEPRECATED ROUTER =============
// This router is deprecated and should not be used.
// All routing is now handled in App.tsx and AdminApp.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';

// This component is deprecated and redirects to the main site
const OptimizedRouter: React.FC = () => {
  console.warn('OptimizedRouter is deprecated. Redirecting to main site.');
  return <Navigate to="/" replace />;
};

export default OptimizedRouter;