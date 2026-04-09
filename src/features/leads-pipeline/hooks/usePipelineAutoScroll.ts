import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook that auto-scrolls a container horizontally when dragging near edges.
 * Returns a ref to attach to the scrollable container, plus start/stop callbacks.
 */
export function usePipelineAutoScroll() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const mouseXRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const startAutoScroll = useCallback(() => {
    isDraggingRef.current = true;
    const scroll = () => {
      if (!isDraggingRef.current) return;
      const container = scrollContainerRef.current;
      if (!container) {
        animationRef.current = requestAnimationFrame(scroll);
        return;
      }
      const rect = container.getBoundingClientRect();
      const x = mouseXRef.current;
      const edge = 120;
      const maxSpeed = 15;

      if (x > 0 && x < rect.left + edge && x >= rect.left) {
        const ratio = 1 - (x - rect.left) / edge;
        container.scrollLeft -= maxSpeed * ratio;
      } else if (x > rect.right - edge && x <= rect.right) {
        const ratio = 1 - (rect.right - x) / edge;
        container.scrollLeft += maxSpeed * ratio;
      }
      animationRef.current = requestAnimationFrame(scroll);
    };
    animationRef.current = requestAnimationFrame(scroll);
  }, []);

  const stopAutoScroll = useCallback(() => {
    isDraggingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return { scrollContainerRef, startAutoScroll, stopAutoScroll };
}
