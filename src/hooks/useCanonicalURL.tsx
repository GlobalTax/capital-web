import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useCanonicalURL = (baseUrl?: string) => {
  const location = useLocation();
  
  useEffect(() => {
    const canonicalUrl = baseUrl || `https://capittal.es${location.pathname}`;
    
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;
    
    return () => {
      // Cleanup is optional since SEOHead also manages canonical
    };
  }, [baseUrl, location.pathname]);
};
