import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HandshakeIcon, 
  BrainCircuit, 
  TrendingUp, 
  Shield, 
  Zap, 
  Award,
  Users,
  Globe,
  DollarSign
} from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

export const EnhancedBenefitsSection = () => {
  const { t } = useI18n();
  
  const benefits = [
  {
    id: 1,
    title: t('collab.benefits.1.title'),
    description: t('collab.benefits.1.desc'),
    icon: HandshakeIcon,
    category: t('collab.benefits.1.category'),
    highlights: [t('collab.benefits.1.highlight1'), t('collab.benefits.1.highlight2'), t('collab.benefits.1.highlight3')]
  },
  {
    id: 2,
    title: t('collab.benefits.2.title'),
    description: t('collab.benefits.2.desc'),
    icon: TrendingUp,
    category: t('collab.benefits.2.category'),
    highlights: [t('collab.benefits.2.highlight1'), t('collab.benefits.2.highlight2'), t('collab.benefits.2.highlight3')]
  },
  {
    id: 3,
    title: t('collab.benefits.3.title'),
    description: t('collab.benefits.3.desc'),
    icon: BrainCircuit,
    category: t('collab.benefits.3.category'),
    highlights: [t('collab.benefits.3.highlight1'), t('collab.benefits.3.highlight2'), t('collab.benefits.3.highlight3')]
  },
  {
    id: 4,
    title: t('collab.benefits.4.title'),
    description: t('collab.benefits.4.desc'),
    icon: Zap,
    category: t('collab.benefits.4.category'),
    highlights: [t('collab.benefits.4.highlight1'), t('collab.benefits.4.highlight2'), t('collab.benefits.4.highlight3')]
  },
  {
    id: 5,
    title: t('collab.benefits.5.title'),
    description: t('collab.benefits.5.desc'),
    icon: Award,
    category: t('collab.benefits.5.category'),
    highlights: [t('collab.benefits.5.highlight1'), t('collab.benefits.5.highlight2'), t('collab.benefits.5.highlight3')]
  },
  {
    id: 6,
    title: t('collab.benefits.6.title'),
    description: t('collab.benefits.6.desc'),
    icon: DollarSign,
    category: t('collab.benefits.6.category'),
    highlights: [t('collab.benefits.6.highlight1'), t('collab.benefits.6.highlight2'), t('collab.benefits.6.highlight3')]
  }
];

export const EnhancedBenefitsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            {t('collab.benefits.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('collab.benefits.subtitle')}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const BenefitIcon = benefit.icon;
            
            return (
              <div key={benefit.id} className="group">
                <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <BenefitIcon className="w-6 h-6 text-black" />
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {benefit.category}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-black mb-4">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                    {benefit.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-3">
                    {benefit.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-300 text-center">
          <div>
            <div className="text-3xl font-bold text-black mb-2">200+</div>
            <div className="text-gray-600 font-medium text-base">Proyectos Completados</div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-black mb-2">€1.5B+</div>
            <div className="text-gray-600 font-medium text-base">Valor Total Gestionado</div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-black mb-2">98%</div>
            <div className="text-gray-600 font-medium text-base">Tasa de Satisfacción</div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-black mb-2">15</div>
            <div className="text-gray-600 font-medium text-base">Años de Experiencia</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedBenefitsSection;