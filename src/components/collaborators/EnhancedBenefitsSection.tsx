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
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 text-primary">
              Beneficios Exclusivos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
              ¿Por qué elegir Capittal?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
              Más que un trabajo, es una plataforma de crecimiento profesional diseñada 
              para expertos que buscan excelencia y impacto en el mundo M&A.
            </p>
          </div>

          {/* Enhanced Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              
              // Create featured items for better visual hierarchy
              const isFeatured = index === 0 || index === 4 || index === 7;
              
              return (
                <Card 
                  key={benefit.id} 
                  className={`
                    admin-card group hover:shadow-[0_10px_15px_-3px_hsl(215_27%_23%_/_0.1)] hover:-translate-y-2 transition-all duration-300
                    ${isFeatured ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20' : 'border-border/60'}
                  `}
                >
                  <CardContent className="p-8 h-full flex flex-col">
                    {/* Enhanced Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110
                        ${isFeatured ? 'bg-primary/15 group-hover:bg-primary/20' : 'bg-primary/10 group-hover:bg-primary/15'}
                      `}>
                        <BenefitIcon className="w-7 h-7 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium bg-secondary/60">
                        {benefit.category}
                      </Badge>
                    </div>

                    {/* Enhanced Content */}
                    <h3 className={`
                      font-bold text-foreground mb-4 group-hover:text-primary transition-colors
                      ${isFeatured ? 'text-xl' : 'text-lg'}
                    `}>
                      {benefit.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed mb-6 flex-1 font-medium">
                      {benefit.description}
                    </p>

                    {/* Enhanced Highlights */}
                    <div className="space-y-3">
                      {benefit.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3 shadow-sm"></div>
                          <span className="font-medium">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Enhanced Summary Stats */}
          <div className="pt-20 border-t border-border/60">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              <div className="group cursor-pointer">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                  200+
                </div>
                <div className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                  Proyectos Completados
                </div>
              </div>
              
              <div className="group cursor-pointer">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                  €1.5B+
                </div>
                <div className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                  Valor Total Gestionado
                </div>
              </div>
              
              <div className="group cursor-pointer">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                  98%
                </div>
                <div className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                  Tasa de Satisfacción
                </div>
              </div>
              
              <div className="group cursor-pointer">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                  15
                </div>
                <div className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                  Años de Experiencia
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedBenefitsSection;