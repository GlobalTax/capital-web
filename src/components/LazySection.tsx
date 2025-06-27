
import React from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';

interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazySection: React.FC<LazySectionProps> = ({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  placeholder,
  fallback
}) => {
  const { ref, isVisible, hasLoaded } = useLazyLoad<HTMLDivElement>({
    threshold,
    rootMargin
  });

  return (
    <div ref={ref} className={className}>
      {!isVisible && placeholder && placeholder}
      {isVisible && children}
      {hasLoaded && !isVisible && fallback && fallback}
    </div>
  );
};

export default LazySection;
