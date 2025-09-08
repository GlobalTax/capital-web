
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
}

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
}

export const useLazyLoad = <T extends HTMLElement>(
  options: UseLazyLoadOptions = {}
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<T>(null);

  const { threshold = 0.3, rootMargin = '50px', root = null, triggerOnce = true } = options;

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setIsVisible(true);
      if (triggerOnce && !hasLoaded) {
        setHasLoaded(true);
      }
    } else if (!triggerOnce) {
      setIsVisible(false);
    }
  }, [hasLoaded, triggerOnce]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
      root
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleIntersection, threshold, rootMargin, root]);

  return {
    ref: elementRef,
    isVisible,
    hasLoaded
  };
};

// Hook para lazy loading de imágenes
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setError(null);
    };

    img.onerror = () => {
      setError('Error al cargar la imagen');
      setIsLoading(false);
    };

    img.src = src;
  }, [src]);

  return {
    src: imageSrc,
    isLoading,
    error
  };
};

// Hook para lazy loading de datos
export const useLazyData = <T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadData = useCallback(async () => {
    if (hasLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, hasLoaded]);

  useEffect(() => {
    loadData();
  }, dependencies);

  return {
    data,
    isLoading,
    error,
    hasLoaded,
    refetch: loadData
  };
};
