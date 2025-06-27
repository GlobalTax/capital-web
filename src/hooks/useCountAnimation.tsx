
import { useState, useEffect } from 'react';
import { useLazyLoad } from './useLazyLoad';

export const useCountAnimation = (end: number, duration: number = 2000, suffix: string = '') => {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useLazyLoad<HTMLDivElement>({ threshold: 0.3 });

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return { count: count + suffix, ref };
};
