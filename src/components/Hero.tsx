import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { supabase } from '@/integrations/supabase/client';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import heroSlide1 from '@/assets/test/hero-slide-1.jpg';
import heroSlide2 from '@/assets/test/hero-slide-2.jpg';
import heroSlide3 from '@/assets/test/hero-slide-3.jpg';

interface SlideData {
  image: string;
  videoUrl?: string;
  title: string;
  subtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryUrl: string;
  ctaSecondaryText: string;
  ctaSecondaryUrl: string;
  isMosaic?: boolean;
}

const fallbackSlides: SlideData[] = [
  {
    image: heroSlide1,
    title: 'Especialistas en\ncompraventa de empresas',
    subtitle: 'Maximizamos el valor de tu empresa con un equipo multidisciplinar de más de 60 profesionales.',
    ctaPrimaryText: 'Contactar',
    ctaPrimaryUrl: '#contacto',
    ctaSecondaryText: 'Valorar mi empresa',
    ctaSecondaryUrl: '/lp/calculadora-web',
  },
  {
    image: '',
    title: 'Un equipo de\n+60 profesionales',
    subtitle: 'Asesores especializados en M&A, fiscalidad, due diligence y valoración de empresas.',
    ctaPrimaryText: 'Conocer al equipo',
    ctaPrimaryUrl: '/nosotros',
    ctaSecondaryText: 'Valorar mi empresa',
    ctaSecondaryUrl: '/lp/calculadora-web',
    isMosaic: true,
  },
  {
    image: heroSlide2,
    title: 'Presencia nacional\ne internacional',
    subtitle: 'Operamos en los principales mercados con una red global de contactos cualificados.',
    ctaPrimaryText: 'Contactar',
    ctaPrimaryUrl: '#contacto',
    ctaSecondaryText: 'Valorar mi empresa',
    ctaSecondaryUrl: '/lp/calculadora-web',
  },
  {
    image: heroSlide3,
    title: 'Asesoramiento\npersonalizado',
    subtitle: 'Cada operación es única. Adaptamos nuestra metodología a tus objetivos específicos.',
    ctaPrimaryText: 'Contactar',
    ctaPrimaryUrl: '#contacto',
    ctaSecondaryText: 'Valorar mi empresa',
    ctaSecondaryUrl: '/lp/calculadora-web',
  },
];

const useHeroSlides = () => {
  return useQuery({
    queryKey: ['hero_slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

interface ServicePill {
  id: string;
  label: string;
  url: string;
  display_order: number;
  is_active: boolean;
}

const useServicePills = () => {
  return useQuery({
    queryKey: ['hero_service_pills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_service_pills')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return (data || []) as ServicePill[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { t } = useI18n();
  const { data: dbSlides } = useHeroSlides();
  const { data: servicePills = [] } = useServicePills();
  const { teamMembers } = useTeamMembers();

  const slides: SlideData[] = React.useMemo(() => {
    if (!dbSlides || dbSlides.length === 0) return fallbackSlides;

    return dbSlides.map((s, i) => ({
      image: s.image_url || fallbackSlides[i]?.image || fallbackSlides[0].image,
      videoUrl: (s as any).video_url || undefined,
      title: s.title || fallbackSlides[i]?.title || '',
      subtitle: s.subtitle || s.description || fallbackSlides[i]?.subtitle || '',
      ctaPrimaryText: s.cta_primary_text || 'Contactar',
      ctaPrimaryUrl: s.cta_primary_url || '#contacto',
      ctaSecondaryText: s.cta_secondary_text || 'Valorar mi empresa',
      ctaSecondaryUrl: s.cta_secondary_url || '/lp/calculadora-web',
    }));
  }, [dbSlides]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const duration = dbSlides?.[currentSlide]?.autoplay_duration || 6000;
    const timer = setInterval(nextSlide, duration);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide, currentSlide, dbSlides]);

  // Reset currentSlide if slides change
  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides.length, currentSlide]);

  const slide = slides[currentSlide];
  if (!slide) return null;

  const isExternal = (url: string) => url.startsWith('http');
  const isAnchor = (url: string) => url.startsWith('#');

  return (
    <ErrorBoundary fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p>Error cargando la sección principal</p></div>}>
      <section className="relative h-screen overflow-hidden">
        {/* Background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {slide.videoUrl ? (
              <>
                {/* Video Background */}
                <video
                  src={slide.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/50 to-foreground/30" />
              </>
            ) : slide.isMosaic && teamMembers.length > 0 ? (
              <>
                <img
                  src={teamMembers[0].image_url || ''}
                  alt="Equipo"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/40" />
              </>
            ) : (
              <>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
              </>
            )}
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
                <h1 className={`font-serif font-normal leading-[1.05] tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl whitespace-pre-line ${slide.isMosaic || slide.videoUrl ? 'text-background' : 'text-foreground'}`}>
                  {slide.title}
                </h1>

                <p className={`text-lg md:text-xl mt-8 max-w-lg leading-relaxed ${slide.isMosaic || slide.videoUrl ? 'text-background/80' : 'text-muted-foreground'}`}>
                  {slide.subtitle}
                </p>

                {/* Service Pills */}
                {!slide.isMosaic && !slide.videoUrl && servicePills.length > 0 && (
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    {servicePills.map((pill, i) => (
                      <React.Fragment key={pill.id}>
                        {i > 0 && <span className="text-muted-foreground/40 select-none">·</span>}
                        <Link
                          to={pill.url}
                          className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium text-foreground/80 bg-white/60 backdrop-blur-sm border border-foreground/20 hover:bg-white/90 transition-colors"
                        >
                          {pill.label}
                        </Link>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  {isAnchor(slide.ctaPrimaryUrl) ? (
                    <a
                      href={slide.ctaPrimaryUrl}
                      className={`inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wide transition-colors ${slide.isMosaic || slide.videoUrl ? 'bg-background text-foreground hover:bg-background/90' : 'bg-foreground text-background hover:bg-foreground/90'}`}
                    >
                      {slide.ctaPrimaryText}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      to={slide.ctaPrimaryUrl}
                      className={`inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wide transition-colors ${slide.isMosaic || slide.videoUrl ? 'bg-background text-foreground hover:bg-background/90' : 'bg-foreground text-background hover:bg-foreground/90'}`}
                    >
                      {slide.ctaPrimaryText}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  )}
                  <Link
                    to={slide.ctaSecondaryUrl}
                    className={`inline-flex items-center gap-3 px-8 py-4 border text-sm font-medium tracking-wide transition-colors ${slide.isMosaic || slide.videoUrl ? 'border-background/30 text-background hover:bg-background/10' : 'border-foreground/20 text-foreground hover:bg-foreground/5'}`}
                  >
                    {slide.ctaSecondaryText}
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
