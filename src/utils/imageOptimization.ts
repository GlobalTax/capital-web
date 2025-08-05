// ============= IMAGE OPTIMIZATION UTILITIES =============
// Utilidades para optimización de imágenes y assets

import React from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  lazy?: boolean;
}

// Generar srcset optimizado para responsive images
export const generateSrcSet = (basePath: string, sizes: number[]): string => {
  return sizes
    .map(size => `${basePath}?w=${size}&q=75 ${size}w`)
    .join(', ');
};

// Hook para lazy loading de imágenes
export const useLazyImage = (src: string, options: ImageOptimizationOptions = {}) => {
  const { lazy = true, quality = 75, format = 'webp' } = options;
  
  // Generar URL optimizada
  const optimizedSrc = `${src}?q=${quality}&f=${format}`;
  
  return {
    src: optimizedSrc,
    loading: lazy ? 'lazy' as const : 'eager' as const,
    decoding: 'async' as const
  };
};

// Preload de imágenes críticas
export const preloadCriticalImages = (images: string[]) => {
  images.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Componente Image optimizado
interface OptimizedImageProps extends ImageOptimizationOptions {
  src: string;
  alt: string;
  className?: string;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className = '',
  ...options 
}: OptimizedImageProps) => {
  const imageProps = useLazyImage(src, options);
  
  return React.createElement('img', {
    ...imageProps,
    alt,
    className
  });
};