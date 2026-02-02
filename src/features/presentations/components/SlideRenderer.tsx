import React from 'react';
import { cn } from '@/lib/utils';
import type { Slide, SlideContent, BrandKit, Theme, Testimonial } from '../types/presentation.types';
import { Quote } from 'lucide-react';
import { sanitizeHtml } from '@/shared/utils/sanitize';

interface SlideRendererProps {
  slide: Slide;
  brandKit?: BrandKit;
  theme?: Theme;
  isPdfMode?: boolean;
  className?: string;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  brandKit,
  theme = 'light',
  isPdfMode = false,
  className
}) => {
  const isDark = theme === 'dark';
  
  const colors = {
    bg: slide.background_color || (isDark ? brandKit?.background_dark : brandKit?.background_light) || (isDark ? '#0f172a' : '#ffffff'),
    text: slide.text_color || (isDark ? '#ffffff' : '#0f172a'),
    accent: brandKit?.accent_color || '#3b82f6',
    secondary: brandKit?.secondary_color || '#64748b'
  };

  const fonts = {
    heading: brandKit?.font_heading || 'Inter',
    body: brandKit?.font_body || 'Inter'
  };

  const baseStyles = {
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: fonts.body
  };

  const renderContent = () => {
    switch (slide.layout) {
      case 'title':
        return <TitleSlide slide={slide} colors={colors} fonts={fonts} brandKit={brandKit} isDark={isDark} />;
      case 'hero':
        return <HeroSlide slide={slide} colors={colors} fonts={fonts} />;
      case 'stats':
        return <StatsSlide slide={slide} colors={colors} fonts={fonts} />;
      case 'bullets':
        return <BulletsSlide slide={slide} colors={colors} fonts={fonts} />;
      case 'comparison':
        return <ComparisonSlide slide={slide} colors={colors} fonts={fonts} />;
      case 'timeline':
        return <TimelineSlide slide={slide} colors={colors} fonts={fonts} />;
      case 'team':
        return <TeamSlide slide={slide} colors={colors} fonts={fonts} />;
      case 'financials':
        return <FinancialsSlide slide={slide} colors={colors} fonts={fonts} />;
      case 'testimonials':
        return <TestimonialsSlide slide={slide} colors={colors} fonts={fonts} />;
      case 'closing':
        return <ClosingSlide slide={slide} colors={colors} fonts={fonts} brandKit={brandKit} />;
      default:
        return <CustomSlide slide={slide} colors={colors} fonts={fonts} />;
    }
  };

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col',
        isPdfMode ? 'page-break-after-always' : '',
        className
      )}
      style={baseStyles}
    >
      {/* Watermark */}
      {brandKit?.watermark_text && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] text-[120px] font-bold rotate-[-30deg]"
          style={{ color: colors.text }}
        >
          {brandKit.watermark_text}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {renderContent()}
      </div>

      {/* Footer */}
      {brandKit?.footer_text && (
        <div 
          className="px-12 py-4 text-xs opacity-60 flex justify-between items-center"
          style={{ color: colors.secondary }}
        >
          <span>{brandKit.footer_text}</span>
          <span className="tabular-nums">{String(slide.order_index + 1).padStart(2, '0')}</span>
        </div>
      )}
    </div>
  );
};

// Title Slide
const TitleSlide: React.FC<{
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
  brandKit?: BrandKit;
  isDark: boolean;
}> = ({ slide, colors, fonts, brandKit, isDark }) => (
  <div className="flex-1 flex flex-col items-center justify-center px-16 text-center">
    {brandKit && (
      <img 
        src={isDark ? (brandKit.logo_dark_url || brandKit.logo_url) : brandKit.logo_url} 
        alt="Logo" 
        className="h-12 mb-16 object-contain"
      />
    )}
    <h1 
      className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 leading-tight"
      style={{ fontFamily: fonts.heading }}
    >
      {slide.headline}
    </h1>
    {slide.subline && (
      <p 
        className="text-xl md:text-2xl opacity-70 max-w-2xl"
        style={{ color: colors.secondary }}
      >
        {slide.subline}
      </p>
    )}
  </div>
);

// Hero Slide
const HeroSlide: React.FC<{
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
}> = ({ slide, colors, fonts }) => (
  <div className="flex-1 flex flex-col justify-center px-16 py-16">
    <h2 
      className="text-4xl md:text-5xl font-semibold tracking-tight mb-12"
      style={{ fontFamily: fonts.heading }}
    >
      {slide.headline}
    </h2>
    {slide.content?.bullets && (
      <ul className="space-y-6 max-w-4xl">
        {slide.content.bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-4 text-xl md:text-2xl">
            <span 
              className="w-2 h-2 rounded-full mt-3 flex-shrink-0"
              style={{ backgroundColor: colors.accent }}
            />
            <span className="opacity-90">{bullet}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// Stats Slide
const StatsSlide: React.FC<{
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
}> = ({ slide, colors, fonts }) => (
  <div className="flex-1 flex flex-col justify-center px-16 py-16">
    <h2 
      className="text-4xl md:text-5xl font-semibold tracking-tight mb-16"
      style={{ fontFamily: fonts.heading }}
    >
      {slide.headline}
    </h2>
    {slide.content?.stats && (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
        {slide.content.stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <div 
              className="text-5xl md:text-6xl font-bold mb-2"
              style={{ color: colors.accent, fontFamily: fonts.heading }}
            >
              {stat.value}
              {stat.suffix && <span className="text-3xl opacity-70">{stat.suffix}</span>}
            </div>
            <div 
              className="text-sm uppercase tracking-wider opacity-60"
              style={{ color: colors.secondary }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Bullets Slide
const BulletsSlide: React.FC<{
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
}> = ({ slide, colors, fonts }) => (
  <div className="flex-1 flex flex-col justify-center px-16 py-16">
    <h2 
      className="text-4xl md:text-5xl font-semibold tracking-tight mb-12"
      style={{ fontFamily: fonts.heading }}
    >
      {slide.headline}
    </h2>
    {slide.subline && (
      <p className="text-lg opacity-70 mb-8 max-w-3xl" style={{ color: colors.secondary }}>
        {slide.subline}
      </p>
    )}
    {slide.content?.bullets && (
      <ul className="space-y-5 max-w-4xl">
        {slide.content.bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-4 text-lg md:text-xl">
            <span 
              className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"
              style={{ backgroundColor: colors.accent }}
            />
            <span className="opacity-85">{bullet}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// Comparison Slide
const ComparisonSlide: React.FC<{
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
}> = ({ slide, colors, fonts }) => (
  <div className="flex-1 flex flex-col justify-center px-16 py-16">
    <h2 
      className="text-4xl md:text-5xl font-semibold tracking-tight mb-16 text-center"
      style={{ fontFamily: fonts.heading }}
    >
      {slide.headline}
    </h2>
    {slide.content?.options && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {slide.content.options.map((option, idx) => (
          <div 
            key={idx} 
            className="p-8 rounded-lg border border-current/10 text-center"
          >
            <div 
              className="text-4xl font-bold mb-4"
              style={{ color: colors.accent }}
            >
              {String.fromCharCode(65 + idx)}
            </div>
            <div className="text-xl font-medium">{option}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Timeline Slide
const TimelineSlide: React.FC<{
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
}> = ({ slide, colors, fonts }) => (
  <div className="flex-1 flex flex-col justify-center px-16 py-16">
    <h2 
      className="text-4xl md:text-5xl font-semibold tracking-tight mb-16"
      style={{ fontFamily: fonts.heading }}
    >
      {slide.headline}
    </h2>
    {slide.content?.phases && (
      <div className="relative">
        <div 
          className="absolute top-6 left-0 right-0 h-0.5 opacity-20"
          style={{ backgroundColor: colors.text }}
        />
        <div className="flex justify-between relative">
          {slide.content.phases.map((phase, idx) => (
            <div key={idx} className="flex flex-col items-center text-center max-w-[200px]">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-4 relative z-10"
                style={{ backgroundColor: colors.accent }}
              >
                {idx + 1}
              </div>
              <div className="text-lg font-medium">{phase}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Team Slide
const TeamSlide: React.FC<{
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
}> = ({ slide, colors, fonts }) => (
  <div className="flex-1 flex flex-col justify-center px-16 py-16">
    <h2 
      className="text-4xl md:text-5xl font-semibold tracking-tight mb-16 text-center"
      style={{ fontFamily: fonts.heading }}
    >
      {slide.headline}
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {[1, 2, 3, 4].map((idx) => (
        <div key={idx} className="text-center">
          <div 
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold"
            style={{ backgroundColor: colors.accent + '20', color: colors.accent }}
          >
            {idx}
          </div>
          <div className="font-medium">Team Member {idx}</div>
          <div className="text-sm opacity-60" style={{ color: colors.secondary }}>Position</div>
        </div>
      ))}
    </div>
  </div>
);

// Financials Slide
const FinancialsSlide: React.FC<{
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
}> = ({ slide, colors, fonts }) => (
  <div className="flex-1 flex flex-col justify-center px-16 py-16">
    <h2 
      className="text-4xl md:text-5xl font-semibold tracking-tight mb-12"
      style={{ fontFamily: fonts.heading }}
    >
      {slide.headline}
    </h2>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-current/20">
            <th className="pb-4 font-medium opacity-60">Metric</th>
            <th className="pb-4 font-medium opacity-60 text-right">2022</th>
            <th className="pb-4 font-medium opacity-60 text-right">2023</th>
            <th className="pb-4 font-medium opacity-60 text-right">2024E</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-current/10">
            <td className="py-4">Revenue</td>
            <td className="py-4 text-right tabular-nums">€XX M</td>
            <td className="py-4 text-right tabular-nums">€XX M</td>
            <td className="py-4 text-right tabular-nums">€XX M</td>
          </tr>
          <tr className="border-b border-current/10">
            <td className="py-4">EBITDA</td>
            <td className="py-4 text-right tabular-nums">€XX M</td>
            <td className="py-4 text-right tabular-nums">€XX M</td>
            <td className="py-4 text-right tabular-nums">€XX M</td>
          </tr>
          <tr>
            <td className="py-4">EBITDA Margin</td>
            <td className="py-4 text-right tabular-nums">XX%</td>
            <td className="py-4 text-right tabular-nums">XX%</td>
            <td className="py-4 text-right tabular-nums">XX%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// Testimonials Slide
const TestimonialsSlide: React.FC<{
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
}> = ({ slide, colors, fonts }) => {
  const testimonials = slide.content?.testimonials || [];
  const gridCols = testimonials.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' 
    : testimonials.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="flex-1 flex flex-col justify-center px-16 py-16">
      <h2 
        className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-center"
        style={{ fontFamily: fonts.heading }}
      >
        {slide.headline}
      </h2>
      {slide.subline && (
        <p 
          className="text-lg opacity-70 mb-12 text-center max-w-2xl mx-auto"
          style={{ color: colors.secondary }}
        >
          {slide.subline}
        </p>
      )}
      <div className={`grid ${gridCols} gap-8`}>
        {testimonials.map((testimonial, idx) => (
          <div 
            key={idx} 
            className="p-8 rounded-xl border border-current/10 flex flex-col"
            style={{ backgroundColor: colors.accent + '08' }}
          >
            <Quote 
              className="w-8 h-8 mb-4 opacity-30"
              style={{ color: colors.accent }}
            />
            <p className="text-lg italic mb-6 flex-1 leading-relaxed opacity-90">
              "{testimonial.quote}"
            </p>
            <div className="flex items-center gap-4">
              {testimonial.image_url ? (
                <img 
                  src={testimonial.image_url} 
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: colors.accent + '20', color: colors.accent }}
                >
                  {testimonial.author.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-semibold">{testimonial.author}</div>
                {(testimonial.role || testimonial.company) && (
                  <div 
                    className="text-sm opacity-60"
                    style={{ color: colors.secondary }}
                  >
                    {testimonial.role}{testimonial.role && testimonial.company && ' · '}{testimonial.company}
                  </div>
                )}
                {testimonial.sector && (
                  <div 
                    className="text-xs mt-1 opacity-50"
                    style={{ color: colors.secondary }}
                  >
                    {testimonial.sector}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Closing Slide
const ClosingSlide: React.FC<{
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
  brandKit?: BrandKit;
}> = ({ slide, colors, fonts, brandKit }) => (
  <div className="flex-1 flex flex-col items-center justify-center px-16 text-center">
    <h2 
      className="text-5xl md:text-6xl font-semibold tracking-tight mb-6"
      style={{ fontFamily: fonts.heading }}
    >
      {slide.headline}
    </h2>
    {slide.subline && (
      <p 
        className="text-xl md:text-2xl opacity-70 mb-12 max-w-2xl"
        style={{ color: colors.secondary }}
      >
        {slide.subline}
      </p>
    )}
    {brandKit?.disclaimer_text && (
      <p 
        className="text-xs opacity-40 max-w-xl mt-16"
        style={{ color: colors.secondary }}
      >
        {brandKit.disclaimer_text}
      </p>
    )}
  </div>
);

// Custom Slide
const CustomSlide: React.FC<{
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
}> = ({ slide, colors, fonts }) => (
  <div className="flex-1 flex flex-col justify-center px-16 py-16">
    {slide.headline && (
      <h2 
        className="text-4xl md:text-5xl font-semibold tracking-tight mb-8"
        style={{ fontFamily: fonts.heading }}
      >
        {slide.headline}
      </h2>
    )}
    {slide.subline && (
      <p 
        className="text-xl opacity-70 max-w-3xl"
        style={{ color: colors.secondary }}
      >
        {slide.subline}
      </p>
    )}
    {slide.content?.custom_html && (
      <div 
        className="prose prose-lg max-w-none mt-8"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.content.custom_html) }}
      />
    )}
  </div>
);

export default SlideRenderer;
