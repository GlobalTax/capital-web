import { useEffect, useCallback } from 'react';

interface PreloaderOptions {
  priority?: 'high' | 'low';
  timeout?: number;
}

export const useImagePreloader = () => {
  const preloadImage = useCallback((src: string, options: PreloaderOptions = {}) => {
    const { priority = 'low', timeout = 10000 } = options;
    
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      // Set loading priority
      if (priority === 'high') {
        img.loading = 'eager';
      }
      
      const timeoutId = setTimeout(() => {
        reject(new Error('Image preload timeout'));
      }, timeout);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to preload image'));
      };
      
      img.src = src;
    });
  }, []);
  
  const preloadImages = useCallback(async (urls: string[], options: PreloaderOptions = {}) => {
    const promises = urls.map(url => preloadImage(url, options));
    return Promise.allSettled(promises);
  }, [preloadImage]);
  
  return { preloadImage, preloadImages };
};

// Hook for critical images preloading
export const useCriticalImagesPreloader = (imageUrls: string[]) => {
  const { preloadImages } = useImagePreloader();
  
  useEffect(() => {
    if (imageUrls.length > 0) {
      preloadImages(imageUrls, { priority: 'high' });
    }
  }, [imageUrls, preloadImages]);
};