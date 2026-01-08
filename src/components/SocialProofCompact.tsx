import React from 'react';
import { useCarouselLogos } from '@/hooks/useCarouselLogos';
import { LazyImage } from '@/components/shared/LazyImage';
import { useI18n } from '@/shared/i18n/I18nProvider';

const SocialProofCompact = () => {
  const { data: logos = [], isLoading } = useCarouselLogos();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-normal text-black mb-6">
            {t('social.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('social.subtitle')}
          </p>
        </div>

        {/* Company Logos */}
        {logos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {logos.map((logo) => (
              <div 
                key={logo.id} 
                className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-300"
              >
                {logo.logo_url ? (
                  <LazyImage
                    src={logo.logo_url}
                    alt={logo.company_name}
                    className="max-h-12 w-auto object-contain"
                    priority={false}
                  />
                ) : (
                  <span className="text-gray-600 font-medium">
                    {logo.company_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialProofCompact;