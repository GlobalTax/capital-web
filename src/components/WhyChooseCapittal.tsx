
import React from 'react';
import { useI18n } from '@/shared/i18n/I18nProvider';

const WhyChooseCapittal = () => {
  const { t } = useI18n();
  
  const reasons = [
    {
      title: t('why.experience.title'),
      description: t('why.experience.description'),
      highlight: t('why.experience.highlight')
    },
    {
      title: t('why.value.title'),
      description: t('why.value.description'),
      highlight: t('why.value.highlight')
    },
    {
      title: t('why.speed.title'),
      description: t('why.speed.description'),
      highlight: t('why.speed.highlight')
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-6">
            {t('why.badge')}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-normal text-black mb-6">
            {t('why.title')}
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('why.subtitle')}
          </p>
        </div>

        {/* Main reasons grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list" aria-label="Razones para elegir Capittal">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group"
              role="listitem"
            >
              {/* Highlight */}
              <div className="flex items-center justify-between mb-6">
                <div className="bg-black text-white px-3 py-1 rounded-lg text-sm font-normal border-0.5 border-border">
                  {reason.highlight}
                </div>
              </div>
              
              <h3 className="text-xl font-normal text-black mb-4">
                {reason.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseCapittal;
