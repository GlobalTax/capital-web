import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

export const useDynamicSEO = (config: SEOConfig) => {
  const location = useLocation();
  
  useEffect(() => {
    // Set title
    document.title = config.title;
    
    // Set meta tags
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    setMetaTag('description', config.description);
    if (config.keywords) setMetaTag('keywords', config.keywords);
    
    // Open Graph
    const setOGTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    setOGTag('og:title', config.title);
    setOGTag('og:description', config.description);
    if (config.ogImage) setOGTag('og:image', config.ogImage);
    
  }, [config, location.pathname]);
};
