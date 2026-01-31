import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import heroSlide1 from '@/assets/test/hero-slide-1.jpg';
import heroSlide2 from '@/assets/test/hero-slide-2.jpg';
import heroSlide3 from '@/assets/test/hero-slide-3.jpg';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
}

const slides: Slide[] = [
  {
    image: heroSlide1,
    title: 'Especialistas en\ncompraventa de empresas',
    subtitle: 'Maximizamos el valor de tu empresa con un equipo multidisciplinar de más de 60 profesionales.',
  },
  {
    image: heroSlide2,
    title: 'Presencia nacional\ne internacional',
    subtitle: 'Operamos en los principales mercados con una red global de contactos cualificados.',
  },
  {
    image: heroSlide3,
    title: 'Asesoramiento\npersonalizado',
    subtitle: 'Cada operación es única. Adaptamos nuestra metodología a tus objetivos específicos.',
  },
];

const HeroSliderSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume autoplay after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          />
          {/* Gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="max-w-2xl"
            >
              {/* Main Headline */}
              <h1 className="font-serif-display text-slate-900 font-normal leading-[1.05] tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl whitespace-pre-line">
                {slides[currentSlide].title}
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-lg md:text-xl mt-8 max-w-lg leading-relaxed">
                {slides[currentSlide].subtitle}
              </p>

              {/* CTA Button */}
              <div className="mt-10">
                <a
                  href="#contacto"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-sm font-medium tracking-wide hover:bg-slate-800 transition-colors"
                >
                  Contactar
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide Indicators - Bottom left */}
      <div className="absolute bottom-12 left-6 lg:left-12 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-0.5 transition-all duration-500 ${
              index === currentSlide
                ? 'w-16 bg-slate-900'
                : 'w-8 bg-slate-400 hover:bg-slate-600'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter - Bottom right */}
      <div className="absolute bottom-12 right-6 lg:right-12 flex items-center gap-2 text-slate-600">
        <span className="text-2xl font-light tabular-nums">
          {String(currentSlide + 1).padStart(2, '0')}
        </span>
        <span className="text-slate-400">/</span>
        <span className="text-sm text-slate-400">
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-500 text-xs tracking-[0.2em] uppercase hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span>Scroll</span>
        <motion.div
          className="w-px h-8 bg-slate-300"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSliderSection;
