// ============= INFINITE SCROLL HOOK =============
// Hook optimizado para infinite scroll con performance monitoring

import { useCallback, useEffect, useRef, useState } from 'react';
import { performanceMonitor } from '@/shared/services/performance-monitor.service';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export const useInfiniteScroll = (
  loadMore: () => Promise<void>,
  hasNextPage: boolean,
  options: UseInfiniteScrollOptions = {}
) => {
  const { threshold = 1.0, rootMargin = '100px', enabled = true } = options;
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver>();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(loadMore);

  // Actualizar ref cuando cambie loadMore
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  const handleIntersect = useCallback(async (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting && hasNextPage && !loading && enabled) {
      setLoading(true);
      
      performanceMonitor.startTimer('infinite-scroll-load', 'interaction');
      
      try {
        await loadMoreRef.current();
      } catch (error) {
        console.error('Error loading more data:', error);
      } finally {
        performanceMonitor.endTimer('infinite-scroll-load');
        setLoading(false);
      }
    }
  }, [hasNextPage, loading, enabled]);

  useEffect(() => {
    if (!sentinelRef.current || !enabled) return;

    observerRef.current = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersect, threshold, rootMargin, enabled]);

  return {
    sentinelRef,
    loading
  };
};