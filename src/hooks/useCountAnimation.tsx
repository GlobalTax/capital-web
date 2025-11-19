
import { useState, useEffect } from 'react';
import { useLazyLoad } from './useLazyLoad';

export const useCountAnimation = (end: number, duration: number = 2000, suffix: string = '') => {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useLazyLoad<HTMLDivElement>({ 
    threshold: 0.2,
    triggerOnce: true 
  });

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    let startTime: number;
    let animationId: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible, end, duration]);

  return { count: `${count}${suffix}`, ref };
};
