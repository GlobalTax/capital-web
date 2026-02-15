import React from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  webpSrc?: string;
  className?: string;
}

/**
 * OptimizedImg — enforces lazy loading, decoding, and explicit dimensions.
 * Use `priority` for above-the-fold / hero images.
 * Provide `webpSrc` to render a <picture> with WebP + fallback.
 */
export const OptimizedImg: React.FC<OptimizedImgProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  webpSrc,
  className,
  ...rest
}) => {
  if (process.env.NODE_ENV === 'development' && !alt) {
    console.warn('[OptimizedImg] Missing alt text for image:', src);
  }

  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    src,
    alt,
    width,
    height,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    className: cn(className),
    ...(priority ? { fetchPriority: 'high' as const } : {}),
    ...rest,
  };

  if (webpSrc) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img {...imgProps} />
      </picture>
    );
  }

  return <img {...imgProps} />;
};

export default OptimizedImg;
