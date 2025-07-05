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

const benefits = [
  {
    id: 1,
    title: 'Red Profesional Exclusiva',
    description: 'Accede a una amplia red de profesionales senior, inversores institucionales y ejecutivos de primer nivel.',
    icon: HandshakeIcon,
    category: 'Networking',
    highlights: ['50+ expertos', 'Eventos exclusivos', 'Colaboración directa']
  },
  {
    id: 2,
    title: 'Proyectos de Alto Impacto',
    description: 'Participa en transacciones complejas de M&A, valoraciones estratégicas y operaciones corporativas.',
    icon: TrendingUp,
    category: 'Experiencia',
    highlights: ['€5M-€100M+ deals', 'Sectores diversificados', 'Casos únicos']
  },
  {
    id: 3,
    title: 'Desarrollo Profesional',
    description: 'Mentoría personalizada, formación continua y acceso a metodologías propietarias de valoración.',
    icon: BrainCircuit,
    category: 'Crecimiento',
    highlights: ['Mentoría 1:1', 'Certificaciones', 'Metodologías avanzadas']
  },
  {
    id: 4,
    title: 'Flexibilidad Total',
    description: 'Trabajo remoto, horarios adaptables y proyectos que se ajustan a tu disponibilidad.',
    icon: Zap,
    category: 'Flexibilidad',
    highlights: ['100% remoto', 'Horarios flexibles', 'Work-life balance']
  },
  {
    id: 5,
    title: 'Reconocimiento Profesional',
    description: 'Firma en informes oficiales, referencias profesionales y reconocimiento público por tu trabajo.',
    icon: Award,
    category: 'Reconocimiento',
    highlights: ['Autoría reconocida', 'Portfolio robusto', 'Referencias sólidas']
  },
  {
    id: 6,
    title: 'Tecnología de Vanguardia',
    description: 'Acceso a herramientas profesionales de valoración, bases de datos especializadas y software exclusivo.',
    icon: Shield,
    category: 'Herramientas',
    highlights: ['Capital IQ/Pitchbook', 'Modelos propietarios', 'Tech stack premium']
  },
  {
    id: 7,
    title: 'Equipo Internacional',
    description: 'Colabora con profesionales de diferentes países y culturas en proyectos cross-border.',
    icon: Globe,
    category: 'Internacional',
    highlights: ['Proyectos Europa', 'Equipos diversos', 'Visión global']
  },
  {
    id: 8,
    title: 'Remuneración Competitiva',
    description: 'Tarifas premium del mercado, bonos por performance y oportunidades de equity en deals.',
    icon: DollarSign,
    category: 'Compensación',
    highlights: ['Tarifas top-market', 'Bonos por éxito', 'Equity participation']
  },
  {
    id: 9,
    title: 'Comunidad Exclusiva',
    description: 'Forma parte de una comunidad selecta de profesionales de M&A con eventos y networking privados.',
    icon: Users,
    category: 'Comunidad',
    highlights: ['Eventos privados', 'Masterclasses', 'Alumni network']
  }
];

export const EnhancedBenefitsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            ¿Por qué elegir Capittal?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Más que un trabajo, es una plataforma de crecimiento profesional diseñada 
            para expertos que buscan excelencia y impacto en el mundo M&A.
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
      </div>
    </section>
  );
};

export default EnhancedBenefitsSection;