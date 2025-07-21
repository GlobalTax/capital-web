
import React from 'react';
import { useLazyImage, useResponsiveImage } from '@/hooks/useLazyImage';
import { cn } from '@/lib/utils';

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
  // Use responsive image if enabled
  const { optimizedSrc } = useResponsiveImage(src, {
    mobile: { width: 360, quality },
    tablet: { width: 768, quality },
    desktop: { width: 1200, quality }
  });

  const finalSrc = responsive ? optimizedSrc : src;

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
    onLoad,
    onError,
    retryAttempts
  });

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
