import React from 'react';
import { Quote, Mail, Phone, Globe, Building2, CheckCircle2 } from 'lucide-react';
import type { Slide, BrandKit } from '../../types/presentation.types';

interface OnePagerSlideProps {
  slide: Slide;
  colors: { bg: string; text: string; accent: string; secondary: string };
  fonts: { heading: string; body: string };
  brandKit?: BrandKit;
}

interface OnePagerContent {
  type: string;
  header: {
    logo_url?: string;
    tagline: string;
    subtitle?: string;
  };
  track_record: {
    title: string;
    stats: Array<{ value: string; label: string }>;
  };
  services: {
    title: string;
    items: Array<{ icon: string; name: string; description: string }>;
  };
  differentiators: {
    title: string;
    items: Array<{ metric: string; text: string }>;
  };
  process: {
    title: string;
    phases: Array<{ number: number; name: string; weeks: string }>;
  };
  testimonial?: {
    quote: string;
    author: string;
    company: string;
    sector?: string;
  };
  contact: {
    title: string;
    subtitle?: string;
    email: string;
    phone: string;
    website: string;
    linkedin?: string;
    cta?: string;
  };
  footer: {
    disclaimer: string;
    group?: string;
  };
}

export const OnePagerSlide: React.FC<OnePagerSlideProps> = ({
  slide,
  colors,
  fonts,
  brandKit
}) => {
  const content = slide.content as unknown as OnePagerContent;
  
  if (!content || content.type !== 'one_pager_commercial') {
    return null;
  }

  return (
    <div 
      className="flex-1 flex flex-col p-8 min-h-full"
      style={{ fontFamily: fonts.body }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: colors.secondary + '30' }}>
        <div className="flex items-center gap-4">
          {brandKit?.logo_url && (
            <img src={brandKit.logo_url} alt="Logo" className="h-10 object-contain" />
          )}
          <div>
            <h1 
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: fonts.heading }}
            >
              {slide.headline}
            </h1>
            <p className="text-sm opacity-70">{content.header.tagline}</p>
          </div>
        </div>
        {content.header.subtitle && (
          <span 
            className="text-xs px-3 py-1 rounded-full"
            style={{ backgroundColor: colors.accent + '15', color: colors.accent }}
          >
            {content.header.subtitle}
          </span>
        )}
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6 flex-1">
        {/* Left Column - Stats + Services */}
        <div className="space-y-5">
          {/* Track Record */}
          <section>
            <h2 
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: colors.accent }}
            >
              {content.track_record.title}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {content.track_record.stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: colors.accent + '08' }}
                >
                  <div 
                    className="text-xl font-bold"
                    style={{ color: colors.accent, fontFamily: fonts.heading }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide opacity-60">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Services */}
          <section>
            <h2 
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: colors.accent }}
            >
              {content.services.title}
            </h2>
            <div className="space-y-2">
              {content.services.items.map((service, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle2 
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: colors.accent }}
                  />
                  <span className="font-medium">{service.name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Center Column - Differentiators + Process */}
        <div className="space-y-5">
          {/* Differentiators */}
          <section>
            <h2 
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: colors.accent }}
            >
              {content.differentiators.title}
            </h2>
            <div className="space-y-3">
              {content.differentiators.items.map((diff, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3"
                >
                  <span 
                    className="text-lg font-bold flex-shrink-0 min-w-[60px]"
                    style={{ color: colors.accent, fontFamily: fonts.heading }}
                  >
                    {diff.metric}
                  </span>
                  <span className="text-sm opacity-80 leading-tight mt-1">
                    {diff.text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Process */}
          <section>
            <h2 
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: colors.accent }}
            >
              {content.process.title}
            </h2>
            <div className="space-y-2">
              {content.process.phases.map((phase, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 text-sm"
                >
                  <span 
                    className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
                    style={{ backgroundColor: colors.accent }}
                  >
                    {phase.number}
                  </span>
                  <span className="font-medium">{phase.name}</span>
                  <span className="text-xs opacity-50 ml-auto">{phase.weeks}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Testimonial + Contact */}
        <div className="space-y-5 flex flex-col">
          {/* Testimonial */}
          {content.testimonial && (
            <section 
              className="p-4 rounded-lg flex-1"
              style={{ backgroundColor: colors.accent + '08' }}
            >
              <Quote 
                className="w-5 h-5 mb-2 opacity-40"
                style={{ color: colors.accent }}
              />
              <p className="text-sm italic leading-relaxed mb-3 opacity-85">
                "{content.testimonial.quote}"
              </p>
              <div className="text-xs">
                <span className="font-semibold">{content.testimonial.author}</span>
                <span className="opacity-60"> · {content.testimonial.company}</span>
              </div>
              {content.testimonial.sector && (
                <div className="text-[10px] opacity-50 mt-0.5">
                  {content.testimonial.sector}
                </div>
              )}
            </section>
          )}

          {/* Contact */}
          <section 
            className="p-4 rounded-lg"
            style={{ backgroundColor: colors.accent + '15' }}
          >
            <h2 
              className="text-lg font-bold mb-1"
              style={{ fontFamily: fonts.heading }}
            >
              {content.contact.title}
            </h2>
            {content.contact.subtitle && (
              <p className="text-xs opacity-70 mb-3">{content.contact.subtitle}</p>
            )}
            <div className="space-y-2">
              <a 
                href={`mailto:${content.contact.email}`}
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
              >
                <Mail className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                <span>{content.contact.email}</span>
              </a>
              <a 
                href={`tel:${content.contact.phone}`}
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
              >
                <Phone className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                <span>{content.contact.phone}</span>
              </a>
              <a 
                href={`https://${content.contact.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
              >
                <Globe className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                <span>{content.contact.website}</span>
              </a>
            </div>
            {content.contact.cta && (
              <div 
                className="mt-3 py-2 px-3 rounded text-center text-sm font-medium text-white"
                style={{ backgroundColor: colors.accent }}
              >
                {content.contact.cta}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="mt-4 pt-3 border-t flex items-center justify-between text-[10px] opacity-50"
        style={{ borderColor: colors.secondary + '30' }}
      >
        <span>{content.footer.disclaimer}</span>
        {content.footer.group && (
          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {content.footer.group}
          </span>
        )}
      </footer>
    </div>
  );
};

export default OnePagerSlide;
