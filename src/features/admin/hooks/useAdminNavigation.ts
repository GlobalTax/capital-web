import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

export const useAdminNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = useCallback((section: string) => {
    navigate(`/admin/${section}`);
  }, [navigate]);

  const isActiveSection = useCallback((section: string) => {
    return location.pathname.includes(`/admin/${section}`);
  }, [location.pathname]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goToDashboard = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  return {
    goToSection,
    isActiveSection,
    goBack,
    goToDashboard,
    currentPath: location.pathname,
  };
};
