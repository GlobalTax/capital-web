
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ServicesSkeleton } from '@/components/LoadingStates';
import { useI18n } from '@/shared/i18n/I18nProvider';

const Services = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ServicesSkeleton />;
  }
  const coreServices = [
    {
      title: t('services.sell.title'),
      description: t('services.sell.description'),
      features: [t('services.sell.feature1'), t('services.sell.feature2'), t('services.sell.feature3')]
    },
    {
      title: t('services.buy.title'),
      description: t('services.buy.description'),
      features: [t('services.buy.feature1'), t('services.buy.feature2'), t('services.buy.feature3')]
    },
    {
      title: t('services.valuations.title'),
      description: t('services.valuations.description'),
      features: [t('services.valuations.feature1'), t('services.valuations.feature2'), t('services.valuations.feature3')]
    },
  ];

  const complementaryServices = [
    {
      title: t('services.ma.title'),
      description: t('services.ma.description'),
    },
    {
      title: t('services.dd.title'),
      description: t('services.dd.description'),
    },
    {
      title: t('services.cf.title'),
      description: t('services.cf.description'),
    },
    {
      title: t('services.restructuring.title'),
      description: t('services.restructuring.description'),
    },
    {
      title: t('services.strategy.title'),
      description: t('services.strategy.description'),
    },
  ];

  return (
    <ErrorBoundary fallback={<ServicesSkeleton />}>
      <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-black mb-6">
            {t('services.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Core Services - Enhanced Cards */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" role="list">
            {coreServices.map((service, index) => (
              <div key={index} className="group" role="listitem">
                <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 ease-out" role="article" aria-labelledby={`service-${index}`}>
                  {/* Title */}
                  <h3 id={`service-${index}`} className="text-xl font-normal text-black mb-4">
                    {service.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed text-base">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <div className="space-y-3">
                    <Link to={
                      service.title === t('services.valuations.title') ? '/lp/calculadora' : 
                      service.title === t('services.sell.title') ? '/venta-empresas' : 
                      '/compra-empresas'
                    }>
                      <Button variant="outline" className="w-full hover:bg-gray-50 hover:text-black transition-all duration-300 ease-out text-base py-3">
                        {service.title === t('services.valuations.title') ? t('services.cta.calculate') : t('services.cta.moreInfo')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
    </ErrorBoundary>
  );
};

export default Services;
