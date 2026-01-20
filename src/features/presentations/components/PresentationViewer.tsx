import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SlideRenderer } from './SlideRenderer';
import type { PresentationProject, Slide } from '../types/presentation.types';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Grid, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PresentationViewerProps {
  presentation: PresentationProject;
  startSlide?: number;
  showControls?: boolean;
  allowDownload?: boolean;
  onSlideChange?: (index: number) => void;
  className?: string;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({
  presentation,
  startSlide = 0,
  showControls = true,
  allowDownload = false,
  onSlideChange,
  className
}) => {
  const [currentSlide, setCurrentSlide] = useState(startSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = presentation.slides?.filter(s => !s.is_hidden) || [];
  const totalSlides = slides.length;

  const goToSlide = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentSlide(newIndex);
    onSlideChange?.(newIndex);
  }, [totalSlides, onSlideChange]);

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showOverview) return;
      
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen?.();
          }
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'o':
          setShowOverview(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen, showOverview]);

  // Touch/Swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Fullscreen
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.current) {
      await containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // PDF Export
  const handleExportPDF = useCallback(() => {
    setIsPdfMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPdfMode(false), 500);
    }, 100);
  }, []);

  // Overview mode
  if (showOverview) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          'w-full h-full bg-slate-900 overflow-auto p-8',
          className
        )}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-white text-2xl font-semibold">{presentation.title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOverview(false)}
            className="text-white hover:bg-white/10"
          >
            Close Overview
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => {
                goToSlide(idx);
                setShowOverview(false);
              }}
              className={cn(
                'aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105',
                currentSlide === idx ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-white/20'
              )}
            >
              <div className="w-full h-full transform scale-[0.25] origin-top-left" style={{ width: '400%', height: '400%' }}>
                <SlideRenderer
                  slide={slide}
                  brandKit={presentation.brand_kit}
                  theme={presentation.theme}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // PDF Mode - all slides visible for print
  if (isPdfMode) {
    return (
      <div className="pdf-export">
        <style>
          {`
            @media print {
              @page {
                size: A4 landscape;
                margin: 0;
              }
              body { margin: 0; }
              .pdf-export { 
                width: 100%; 
              }
              .pdf-slide {
                width: 297mm;
                height: 210mm;
                page-break-after: always;
                page-break-inside: avoid;
                overflow: hidden;
              }
              .pdf-slide:last-child {
                page-break-after: auto;
              }
            }
          `}
        </style>
        {slides.map((slide) => (
          <div key={slide.id} className="pdf-slide">
            <SlideRenderer
              slide={slide}
              brandKit={presentation.brand_kit}
              theme={presentation.theme}
              isPdfMode
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-screen overflow-hidden bg-slate-900 select-none',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {slides[currentSlide] && (
            <SlideRenderer
              slide={slides[currentSlide]}
              brandKit={presentation.brand_kit}
              theme={presentation.theme}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Areas (click zones) */}
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className="absolute left-0 top-0 w-1/4 h-full cursor-pointer z-10 opacity-0 hover:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-white" />
        </div>
      </button>
      
      <button
        onClick={nextSlide}
        disabled={currentSlide === totalSlides - 1}
        className="absolute right-0 top-0 w-1/4 h-full cursor-pointer z-10 opacity-0 hover:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 flex items-center justify-center">
          <ChevronRight className="w-6 h-6 text-white" />
        </div>
      </button>

      {/* Progress Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm text-white/80 text-sm tabular-nums">
          <span className="font-medium">{String(currentSlide + 1).padStart(2, '0')}</span>
          <span className="opacity-50">/</span>
          <span className="opacity-70">{String(totalSlides).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOverview(true)}
            className="text-white/70 hover:text-white hover:bg-white/10"
            title="Overview (O)"
          >
            <Grid className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white/70 hover:text-white hover:bg-white/10"
            title="Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </Button>

          {allowDownload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportPDF}
              className="text-white/70 hover:text-white hover:bg-white/10"
              title="Export PDF"
            >
              <FileDown className="w-5 h-5" />
            </Button>
          )}
        </div>
      )}

      {/* Keyboard hints (show briefly on load) */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 text-white/50 text-xs flex gap-4"
      >
        <span>← → Navigate</span>
        <span>F Fullscreen</span>
        <span>O Overview</span>
      </motion.div>
    </div>
  );
};

export default PresentationViewer;
