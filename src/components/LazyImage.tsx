
import React from 'react';
import { useLazyImage, useLazyLoad } from '@/hooks/useLazyLoad';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = '',
  placeholderClassName = '',
  onLoad,
  onError
}) => {
  const { ref, isVisible } = useLazyLoad<HTMLDivElement>({ 
    threshold: 0.1,
    rootMargin: '50px'
  });

  const { 
    src: imageSrc, 
    isLoading, 
    error 
  } = useLazyImage(isVisible ? src : '', placeholder);

  React.useEffect(() => {
    if (!isLoading && !error && imageSrc === src) {
      onLoad?.();
    }
  }, [isLoading, error, imageSrc, src, onLoad]);

  React.useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  return (
    <div ref={ref} className={className}>
      {isLoading && placeholder && (
        <div className={`animate-pulse bg-gray-200 ${placeholderClassName}`}>
          <div className="w-full h-full bg-gray-300 rounded"></div>
        </div>
      )}
      
      {error && (
        <div className={`bg-gray-100 flex items-center justify-center ${placeholderClassName}`}>
          <span className="text-gray-500 text-sm">Error al cargar imagen</span>
        </div>
      )}
      
      {imageSrc && !error && (
        <img
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;
