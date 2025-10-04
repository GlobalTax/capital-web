
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useAdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  return {
    sidebarCollapsed,
    setSidebarCollapsed,
    current: location.pathname
  };
};
