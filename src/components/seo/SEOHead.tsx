import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object | object[];
  noindex?: boolean;
  keywords?: string;
}

export const SEOHead = ({ 
  title, 
  description, 
  canonical, 
  ogImage = 'https://capittal.es/og-default.jpg',
  structuredData,
  noindex = false,
  keywords
}: SEOHeadProps) => {
  useEffect(() => {
    // Set title
    if (title) {
      document.title = title;
    }
    
    // Set description
    if (description) {
      setMetaTag('name', 'description', description);
    }
    
    // Set keywords if provided
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }
    
    // Set robots
    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }
    
    // Set canonical
    if (canonical) {
      setCanonical(canonical);
    }
    
    // Set Open Graph tags with enhanced metadata
    if (title) {
      setMetaTag('property', 'og:title', title);
      setMetaTag('name', 'twitter:title', title);
    }
    if (description) {
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }
    if (canonical) {
      setMetaTag('property', 'og:url', canonical);
    }
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
      setMetaTag('name', 'twitter:image', ogImage);
    }
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'Capittal');
    setMetaTag('property', 'og:locale', 'es_ES');
    setMetaTag('property', 'og:locale:alternate', 'ca_ES');
    setMetaTag('property', 'og:locale:alternate', 'gl_ES');
    
    // Set Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    
    // Set structured data
    if (structuredData) {
      setStructuredData(structuredData);
    }
    
    return () => {
      // Cleanup structured data on unmount
      removeStructuredData();
    };
  }, [title, description, canonical, ogImage, structuredData, noindex, keywords]);
  
  return null;
};

// Helper function to set meta tags
const setMetaTag = (attribute: string, key: string, content: string) => {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

// Helper function to set canonical link
const setCanonical = (url: string) => {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.href = url;
};

// Helper function to set structured data
const setStructuredData = (data: object | object[]) => {
  // Remove existing structured data
  removeStructuredData();
  
  // Create new script element
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'seo-structured-data';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

// Helper function to remove structured data
const removeStructuredData = () => {
  const existingScript = document.getElementById('seo-structured-data');
  if (existingScript) {
    existingScript.remove();
  }
};
