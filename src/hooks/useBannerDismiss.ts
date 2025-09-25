import { useState, useEffect } from 'react';

interface UseBannerDismissResult {
  isDismissed: boolean;
  dismissBanner: () => void;
  resetDismissal: () => void;
}

export const useBannerDismiss = (
  id: string,
  version: string = '1.0'
): UseBannerDismissResult => {
  const storageKey = `banner:dismissed:${id}:${version}`;
  
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    
    try {
      const dismissed = localStorage.getItem(storageKey);
      return dismissed !== null;
    } catch (error) {
      console.warn('Failed to read banner dismissal from localStorage:', error);
      return false;
    }
  });

  const dismissBanner = () => {
    try {
      localStorage.setItem(storageKey, new Date().toISOString());
      setIsDismissed(true);
    } catch (error) {
      console.warn('Failed to save banner dismissal to localStorage:', error);
    }
  };

  const resetDismissal = () => {
    try {
      localStorage.removeItem(storageKey);
      setIsDismissed(false);
    } catch (error) {
      console.warn('Failed to remove banner dismissal from localStorage:', error);
    }
  };

  useEffect(() => {
    // Re-check dismissal status when id or version changes
    if (typeof window === 'undefined') return;
    
    try {
      const dismissed = localStorage.getItem(storageKey);
      setIsDismissed(dismissed !== null);
    } catch (error) {
      console.warn('Failed to read banner dismissal from localStorage:', error);
    }
  }, [storageKey]);

  return {
    isDismissed,
    dismissBanner,
    resetDismissal,
  };
};