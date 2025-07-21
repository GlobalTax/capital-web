
import React from 'react';
import { useLazyImage, useResponsiveImage } from '@/hooks/useLazyImage';
import { cn } from '@/lib/utils';
import { useImagePerformanceTracking } from '@/utils/imagePerformanceMonitor';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  responsive?: boolean;
  quality?: number;
  retryAttempts?: number;
  threshold?: number;
  rootMargin?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = '',
  placeholderClassName = '',
  onLoad,
  onError,
  responsive = true,
  quality = 80,
  retryAttempts = 3,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const { trackImageLoad } = useImagePerformanceTracking();
  const loadStartTime = React.useRef<number>(0);

  // Use responsive image if enabled
  const { optimizedSrc } = useResponsiveImage(src, {
    mobile: { width: 360 },
    tablet: { width: 768 },
    desktop: { width: 1200 }
  });

  const finalSrc = responsive ? optimizedSrc : src;

  // Enhanced onLoad callback with performance tracking
  const handleLoad = React.useCallback(() => {
    if (loadStartTime.current > 0) {
      trackImageLoad(finalSrc, loadStartTime.current);
    }
    onLoad?.();
  }, [finalSrc, trackImageLoad, onLoad]);

  // Enhanced onError callback
  const handleError = React.useCallback((error: string) => {
    if (loadStartTime.current > 0) {
      trackImageLoad(finalSrc, loadStartTime.current);
    }
    onError?.(error);
  }, [finalSrc, trackImageLoad, onError]);

  // Use lazy loading
  const {
    ref,
    src: loadedSrc,
    isLoading,
    error,
    hasLoaded
  } = useLazyImage(finalSrc, {
    threshold,
    rootMargin,
    placeholder,
    onLoad: handleLoad,
    onError: handleError,
    retryAttempts
  });

  // Track load start time
  React.useEffect(() => {
    if (loadedSrc && !hasLoaded) {
      loadStartTime.current = performance.now();
    }
  }, [loadedSrc, hasLoaded]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
          placeholderClassName
        )}>
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded" />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className={cn(
          'absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm',
          placeholderClassName
        )}>
          <div className="text-center">
            <div className="text-gray-400 mb-2">⚠️</div>
            <div>Error al cargar imagen</div>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      {loadedSrc && !error && (
        <img
          src={loadedSrc}
          alt={alt}
          className={cn(
            'transition-all duration-300 ease-in-out',
            isLoading || !hasLoaded ? 'opacity-0' : 'opacity-100',
            className
          )}
          loading="lazy"
          draggable={false}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
