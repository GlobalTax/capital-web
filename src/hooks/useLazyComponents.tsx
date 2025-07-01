
import { useState, useEffect, useRef, useCallback } from 'react';

interface LazyComponentConfig {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useLazyComponents = (config: LazyComponentConfig = {}) => {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = config;
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  const resetVisibility = useCallback(() => {
    if (!triggerOnce) {
      setIsVisible(false);
      setHasTriggered(false);
    }
  }, [triggerOnce]);

  return {
    elementRef,
    isVisible: triggerOnce ? hasTriggered || isVisible : isVisible,
    hasTriggered,
    resetVisibility
  };
};

// Hook para precargar componentes de manera inteligente
export const useComponentPreloader = () => {
  const [preloadedComponents, setPreloadedComponents] = useState<Set<string>>(new Set());

  const preloadComponent = useCallback(async (
    importFn: () => Promise<any>,
    componentName: string
  ) => {
    if (preloadedComponents.has(componentName)) return;

    try {
      await importFn();
      setPreloadedComponents(prev => new Set([...prev, componentName]));
    } catch (error) {
      console.error(`Error preloading component ${componentName}:`, error);
    }
  }, [preloadedComponents]);

  const isComponentPreloaded = useCallback((componentName: string) => {
    return preloadedComponents.has(componentName);
  }, [preloadedComponents]);

  return {
    preloadComponent,
    isComponentPreloaded,
    preloadedComponents: Array.from(preloadedComponents)
  };
};
