
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyImageOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
  placeholder?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

interface LazyImageState {
  src: string;
  isLoading: boolean;
  error: string | null;
  isVisible: boolean;
  hasLoaded: boolean;
}

export const useLazyImage = (
  imageSrc: string,
  options: UseLazyImageOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    root = null,
    placeholder = '',
    onLoad,
    onError,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<LazyImageState>({
    src: placeholder,
    isLoading: false,
    error: null,
    isVisible: false,
    hasLoaded: false
  });

  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const retryCountRef = useRef(0);
  const imageCache = useRef<Map<string, string>>(new Map());

  // Cache management
  const getCachedImage = useCallback((url: string) => {
    return imageCache.current.get(url);
  }, []);

  const setCachedImage = useCallback((url: string, loadedSrc: string) => {
    imageCache.current.set(url, loadedSrc);
  }, []);

  // Image loading function with retry logic
  const loadImage = useCallback(async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check cache first
      const cached = getCachedImage(url);
      if (cached) {
        resolve(cached);
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        setCachedImage(url, url);
        resolve(url);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Support for WebP with fallback
      img.src = url;
    });
  }, [getCachedImage, setCachedImage]);

  // Retry mechanism
  const retryLoad = useCallback(async (url: string) => {
    if (retryCountRef.current < retryAttempts) {
      retryCountRef.current++;
      
      await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));
      
      try {
        const loadedSrc = await loadImage(url);
        setState(prev => ({
          ...prev,
          src: loadedSrc,
          isLoading: false,
          error: null,
          hasLoaded: true
        }));
        onLoad?.();
      } catch (error) {
        await retryLoad(url);
      }
    } else {
      const errorMessage = `Failed to load image after ${retryAttempts} attempts`;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      onError?.(errorMessage);
    }
  }, [retryAttempts, retryDelay, loadImage, onLoad, onError]);

  // Main image loading effect
  useEffect(() => {
    if (state.isVisible && imageSrc && !state.hasLoaded && !state.isLoading) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      retryCountRef.current = 0;

      loadImage(imageSrc)
        .then(loadedSrc => {
          setState(prev => ({
            ...prev,
            src: loadedSrc,
            isLoading: false,
            hasLoaded: true
          }));
          onLoad?.();
        })
        .catch(() => {
          retryLoad(imageSrc);
        });
    }
  }, [state.isVisible, imageSrc, state.hasLoaded, state.isLoading, loadImage, retryLoad]);

  // Intersection Observer setup
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !state.hasLoaded) {
        setState(prev => ({ ...prev, isVisible: true }));
        
        // Disconnect observer after first intersection
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
      root
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, root, state.hasLoaded]);

  return {
    ref: elementRef,
    src: state.src,
    isLoading: state.isLoading,
    error: state.error,
    isVisible: state.isVisible,
    hasLoaded: state.hasLoaded
  };
};

// WebP detection utility
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Image optimization utilities
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  // If it's a Supabase storage URL, add transformation parameters
  if (originalUrl.includes('supabase')) {
    const url = new URL(originalUrl);
    const params = new URLSearchParams();
    
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format) params.set('format', options.format);
    
    if (params.toString()) {
      url.search = params.toString();
    }
    
    return url.toString();
  }
  
  return originalUrl;
};

// Responsive image hook
export const useResponsiveImage = (
  imageSrc: string,
  breakpoints: { [key: string]: { width: number; height?: number } } = {
    mobile: { width: 360 },
    tablet: { width: 768 },
    desktop: { width: 1200 }
  }
) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setCurrentBreakpoint('mobile');
      else if (width < 1024) setCurrentBreakpoint('tablet');
      else setCurrentBreakpoint('desktop');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const optimizedSrc = getOptimizedImageUrl(imageSrc, breakpoints[currentBreakpoint]);

  return { optimizedSrc, currentBreakpoint };
};
