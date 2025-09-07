import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Target, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CaseStudyDetailProps {
  title: string;
  sector: string;
  year: number;
  description: string;
  highlights: string[];
  logoUrl?: string;
  valueAmount?: number;
  valueCurrency?: string;
  isValueConfidential: boolean;
}

const CaseStudyDetail: React.FC<CaseStudyDetailProps> = ({
  title,
  sector,
  year,
  description,
  highlights,
  logoUrl,
  valueAmount,
  valueCurrency,
  isValueConfidential
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/20">
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {sector}
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                {year}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
          {logoUrl && (
            <div className="ml-6 flex-shrink-0">
              <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={logoUrl} 
                  alt={`Logo ${title}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border/20 pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-primary" />
                Aspectos Destacados
              </h4>
              <ul className="space-y-2">
                {highlights.map((highlight, index) => (
                  <li key={index} className="text-muted-foreground text-sm flex items-start">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            
            {(valueAmount || isValueConfidential) && (
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                  Valor de la Operación
                </h4>
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">
                    {isValueConfidential ? 'Confidencial' : `${valueAmount}M${valueCurrency}`}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Transacción exitosa
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailedCaseStudies = () => {
  const navigate = useNavigate();

  const featuredCases = [
    {
      title: "Jamboree se integra en Ceranium",
      sector: "Salud y Biotecnología", 
      year: 2025,
      description: "El Laboratorio dental Jamboree se integra en Ceranium, compañía participada por ABE Capital. Una operación que demuestra nuestra capacidad para identificar sinergias estratégicas en el sector sanitario y facilitar integraciones exitosas en tiempo récord.",
      highlights: [
        "Sector en consolidación",
        "Venta en menos de 8 meses", 
        "Laboratorio líder en Barcelona"
      ],
      logoUrl: "https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/case-studies/logos/1756723321543_ka4ryq.png",
      isValueConfidential: true
    },
    {
      title: "Mitie España Adquiere Grupo Visegurity",
      sector: "Seguridad",
      year: 2024,
      description: "La multinacional británica MITIE adquiere Grupo Visegurity por 12M€. Capittal asesoró a la parte vendedora en esta operación internacional, demostrando nuestra capacidad para conectar empresas españolas con compradores globales.",
      highlights: [
        "Proceso de Venta",
        "Comprador Internacional", 
        "Asesoramiento 360º"
      ],
      logoUrl: "https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/case-studies/logos/1756722616293_r2k55.png",
      valueAmount: 12,
      valueCurrency: "€",
      isValueConfidential: false
    },
    {
      title: "Grupo Scutum adquiere Grupo SEA",
      sector: "Seguridad",
      year: 2024, 
      description: "Grupo Scutum, multinacional líder en seguridad electrónica, adquiere Grupo SEA. En esta ocasión, Capittal asesoró a la parte compradora en el desarrollo de su estrategia de crecimiento mediante adquisiciones.",
      highlights: [
        "Asesoramiento al comprador",
        "Desarrollo de proyecto Build-Up",
        "Intermediación y Due Diligence"
      ],
      logoUrl: "https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/case-studies/logos/1756723130999_g0395m.png", 
      isValueConfidential: true
    }
  ];

  const handleContactClick = () => {
    navigate('/contacto');
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Casos de Éxito
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Más de 200 transacciones exitosas que demuestran nuestra experiencia y capacidad 
              para maximizar el valor en cada operación. Descubre algunas de nuestras historias más destacadas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Transacciones Exitosas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">€2.5B+</div>
              <div className="text-muted-foreground">Valor Total Asesorado</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">Tasa de Éxito</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-4">
              Historias de Éxito Destacadas
            </h2>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
              Cada operación cuenta una historia única. Estos son algunos de nuestros casos más representativos 
              que muestran nuestra capacidad para crear valor en diferentes sectores y situaciones.
            </p>
          </div>

          <div className="space-y-12">
            {featuredCases.map((caseStudy, index) => (
              <CaseStudyDetail
                key={index}
                {...caseStudy}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Nuestro Proceso de Éxito
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Detrás de cada caso de éxito hay un proceso meticuloso y personalizado
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Análisis Inicial</h3>
              <p className="text-muted-foreground text-sm">
                Evaluación completa de la empresa y definición de la estrategia óptima
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Preparación</h3>
              <p className="text-muted-foreground text-sm">
                Optimización de procesos y preparación de documentación estratégica
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Ejecución</h3>
              <p className="text-muted-foreground text-sm">
                Intermediación activa y negociación para maximizar el valor
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Cierre</h3>
              <p className="text-muted-foreground text-sm">
                Acompañamiento hasta la finalización exitosa de la operación
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para Escribir tu Historia de Éxito?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Cada empresa tiene una historia única. Permítenos ayudarte a escribir la tuya 
            con una valoración gratuita y sin compromiso.
          </p>
          <Button 
            onClick={handleContactClick}
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-4 h-auto"
          >
            Contactar Ahora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default DetailedCaseStudies;