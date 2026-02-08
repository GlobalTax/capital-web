import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useI18n } from '@/shared/i18n/I18nProvider';
import heroSlide1 from '@/assets/test/hero-slide-1.jpg';
import heroSlide2 from '@/assets/test/hero-slide-2.jpg';
import heroSlide3 from '@/assets/test/hero-slide-3.jpg';

interface Slide {
  image: string;
  titleKey: string;
  subtitleKey: string;
  titleFallback: string;
  subtitleFallback: string;
}

const slides: Slide[] = [
  {
    image: heroSlide1,
    titleKey: 'hero.slide1.title',
    subtitleKey: 'hero.slide1.subtitle',
    titleFallback: 'Especialistas en\ncompraventa de empresas',
    subtitleFallback: 'Maximizamos el valor de tu empresa con un equipo multidisciplinar de más de 60 profesionales.',
  },
  {
    image: heroSlide2,
    titleKey: 'hero.slide2.title',
    subtitleKey: 'hero.slide2.subtitle',
    titleFallback: 'Presencia nacional\ne internacional',
    subtitleFallback: 'Operamos en los principales mercados con una red global de contactos cualificados.',
  },
  {
    image: heroSlide3,
    titleKey: 'hero.slide3.title',
    subtitleKey: 'hero.slide3.subtitle',
    titleFallback: 'Asesoramiento\npersonalizado',
    subtitleFallback: 'Cada operación es única. Adaptamos nuestra metodología a tus objetivos específicos.',
  },
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { t } = useI18n();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const getTitle = (slide: Slide) => {
    const translated = t(slide.titleKey);
    return translated === slide.titleKey ? slide.titleFallback : translated;
  };

  const getSubtitle = (slide: Slide) => {
    const translated = t(slide.subtitleKey);
    return translated === slide.subtitleKey ? slide.subtitleFallback : translated;
  };

  return (
    <ErrorBoundary fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p>Error cargando la sección principal</p></div>}>
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
                <h1 className="font-serif text-foreground font-normal leading-[1.05] tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl whitespace-pre-line">
                  {getTitle(slides[currentSlide])}
                </h1>

                <p className="text-muted-foreground text-lg md:text-xl mt-8 max-w-lg leading-relaxed">
                  {getSubtitle(slides[currentSlide])}
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <a
                    href="#contacto"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-colors"
                  >
                    {t('hero.cta.contact') === 'hero.cta.contact' ? 'Contactar' : t('hero.cta.contact')}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                  <Link
                    to="/lp/calculadora-web"
                    className="inline-flex items-center gap-3 px-8 py-4 border border-foreground/20 text-foreground text-sm font-medium tracking-wide hover:bg-foreground/5 transition-colors"
                  >
                    {t('hero.cta.valuate') === 'hero.cta.valuate' ? 'Valorar mi empresa' : t('hero.cta.valuate')}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 left-6 lg:left-12 flex items-center gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-0.5 transition-all duration-500 ${
                index === currentSlide
                  ? 'w-16 bg-foreground'
                  : 'w-8 bg-foreground/40 hover:bg-foreground/60'
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-12 right-6 lg:right-12 flex items-center gap-2 text-muted-foreground z-20">
          <span className="text-2xl font-light tabular-nums">
            {String(currentSlide + 1).padStart(2, '0')}
          </span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-sm text-muted-foreground/60">
            {String(slides.length).padStart(2, '0')}
          </span>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-muted-foreground text-xs tracking-[0.2em] uppercase hidden md:flex flex-col items-center gap-2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <span>Scroll</span>
          <motion.div
            className="w-px h-8 bg-border"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </section>
    </ErrorBoundary>
  );
};

export default Hero;
