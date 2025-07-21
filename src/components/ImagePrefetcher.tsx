import React, { useEffect } from 'react';
import { useImagePreloader } from '@/hooks/useImagePreloader';

interface ImagePrefetcherProps {
  images: string[];
  priority?: 'high' | 'low';
}

export const ImagePrefetcher: React.FC<ImagePrefetcherProps> = ({ 
  images, 
  priority = 'low' 
}) => {
  const { preloadImages } = useImagePreloader();
  
  useEffect(() => {
    if (images.length > 0) {
      preloadImages(images, { priority });
    }
  }, [images, priority, preloadImages]);
  
  return null; // Component invisible, solo hace prefetch
};

// Hook para prefetch automático de imágenes por página
export const usePageImagePrefetch = (route: string) => {
  const { preloadImages } = useImagePreloader();
  
  useEffect(() => {
    const prefetchByRoute = async () => {
      switch (route) {
        case '/equipo':
          // Prefetch team images
          break;
        case '/casos-exito':
          // Prefetch case study images  
          break;
        case '/testimonios':
          // Prefetch testimonial images
          break;
        default:
          break;
      }
    };
    
    prefetchByRoute();
  }, [route, preloadImages]);
};