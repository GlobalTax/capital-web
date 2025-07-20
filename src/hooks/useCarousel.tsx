
import { useState, useEffect } from 'react';

export interface UseCarouselOptions {
  autoPlay?: boolean;
  interval?: number;
  itemsToShow?: number;
  infinite?: boolean;
}

export interface UseCarouselReturn {
  currentIndex: number;
  totalItems: number;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  isAutoPlaying: boolean;
  startAutoPlay: () => void;
  stopAutoPlay: () => void;
}

export const useCarousel = (
  totalItems: number, 
  options: UseCarouselOptions = {}
): UseCarouselReturn => {
  const {
    autoPlay = false,
    interval = 3000,
    itemsToShow = 1,
    infinite = true
  } = options;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(autoPlay);

  const nextSlide = (): void => {
    if (infinite) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
    } else {
      setCurrentIndex((prevIndex) => 
        prevIndex < totalItems - itemsToShow ? prevIndex + 1 : prevIndex
      );
    }
  };

  const prevSlide = (): void => {
    if (infinite) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
    } else {
      setCurrentIndex((prevIndex) => prevIndex > 0 ? prevIndex - 1 : prevIndex);
    }
  };

  const goToSlide = (index: number): void => {
    if (index >= 0 && index < totalItems) {
      setCurrentIndex(index);
    }
  };

  const startAutoPlay = (): void => setIsAutoPlaying(true);
  const stopAutoPlay = (): void => setIsAutoPlaying(false);

  useEffect(() => {
    if (!isAutoPlaying || totalItems <= 1) return;

    const intervalId = setInterval(nextSlide, interval);
    return () => clearInterval(intervalId);
  }, [isAutoPlaying, interval, totalItems]);

  return {
    currentIndex,
    totalItems,
    nextSlide,
    prevSlide,
    goToSlide,
    isAutoPlaying,
    startAutoPlay,
    stopAutoPlay,
  };
};
