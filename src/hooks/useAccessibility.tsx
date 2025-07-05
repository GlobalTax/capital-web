import { useEffect, useState } from 'react';

interface AccessibilityPreferences {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
  fontSize: 'small' | 'medium' | 'large';
}

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersColorScheme: 'no-preference',
    fontSize: 'medium'
  });

  useEffect(() => {
    // Detectar preferencias del sistema
    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
        prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : window.matchMedia('(prefers-color-scheme: light)').matches 
            ? 'light' 
            : 'no-preference',
        fontSize: (localStorage.getItem('fontSize') as any) || 'medium'
      });
    };

    updatePreferences();

    // Listeners para cambios en preferencias
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => updatePreferences();

    reducedMotionQuery.addEventListener('change', handleChange);
    highContrastQuery.addEventListener('change', handleChange);
    darkModeQuery.addEventListener('change', handleChange);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleChange);
      highContrastQuery.removeEventListener('change', handleChange);
      darkModeQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    localStorage.setItem('fontSize', size);
    setPreferences(prev => ({ ...prev, fontSize: size }));
    
    // Aplicar clase CSS al body
    document.body.className = document.body.className.replace(/font-size-\w+/g, '');
    document.body.classList.add(`font-size-${size}`);
  };

  const announceLiveRegion = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  };

  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      // Scroll al elemento si es necesario
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return {
    preferences,
    setFontSize,
    announceLiveRegion,
    focusElement
  };
};

export default useAccessibility;