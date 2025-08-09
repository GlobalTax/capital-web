import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, ArrowRight, Target, TrendingUp } from 'lucide-react';
import StandaloneCompanyForm from '@/components/standalone/StandaloneCompanyForm';
import StandaloneCalculator from '@/components/standalone/StandaloneCalculator';
import { CompanyDataV4 } from '@/types/valuationV4';
import { useSectorMultiplesByName } from '@/hooks/useSectorMultiples';

interface SectorCalculatorProps {
  sectorName: string;
  sectorDescription: string;
  heroImage?: string;
  keyBenefits?: string[];
  industryInsights?: string[];
}

export const SectorCalculator: React.FC<SectorCalculatorProps> = ({
  sectorName,
  sectorDescription,
  heroImage,
  keyBenefits = [],
  industryInsights = []
}) => {
  const [companyData, setCompanyData] = useState<CompanyDataV4 | null>(null);
  const { data: sectorMultiples, isLoading } = useSectorMultiplesByName(sectorName);

  const handleFormSubmit = (data: CompanyDataV4) => {
    setCompanyData({ ...data, industry: sectorName });
    setTimeout(() => {
      document.getElementById('calculator-results')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handleReset = () => {
    setCompanyData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (companyData) {
    return (
      <div id="calculator-results" className="min-h-screen">
        <StandaloneCalculator 
          companyData={companyData}
          onReset={handleReset}
        />
      </div>
    );
  }

  const defaultBenefits = [
    `Múltiplos específicos para ${sectorDescription.toLowerCase()}`,
    'Análisis adaptado a las características del sector',
    'Comparativa con empresas similares',
    'Recomendaciones personalizadas'
  ];

  const defaultInsights = [
    'Factores clave de valoración en el sector',
    'Tendencias de mercado y oportunidades',
    'Métricas de rendimiento sectoriales',
    'Casos de éxito relevantes'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6 text-sm font-medium">
              <Calculator className="w-4 h-4 mr-2" />
              Calculadora Especializada
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
              Valoración para {sectorDescription}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Obtén una valoración precisa y personalizada para tu empresa del sector {sectorDescription.toLowerCase()}, 
              utilizando múltiplos específicos y metodologías adaptadas a las características únicas de tu industria.
            </p>

            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Cargando múltiplos sectoriales...
              </div>
            ) : sectorMultiples && sectorMultiples.length > 0 && (
              <div className="text-sm text-muted-foreground mb-8">
                Utilizamos {sectorMultiples.length} rangos de múltiplos específicos para este sector
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Formulario */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <StandaloneCompanyForm onSubmit={handleFormSubmit} />
          </motion.div>
        </div>
      </section>

      {/* Beneficios del Sector */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              Ventajas de la Valoración Sectorial
            </h2>
            <p className="text-muted-foreground text-lg">
              Nuestra metodología especializada te ofrece resultados más precisos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(keyBenefits.length > 0 ? keyBenefits : defaultBenefits).map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm leading-relaxed">{benefit}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights del Sector */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              Análisis Especializado del Sector
            </h2>
            <p className="text-muted-foreground text-lg">
              Comprende los factores únicos que influyen en la valoración de tu industria
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {(industryInsights.length > 0 ? industryInsights : defaultInsights).map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-secondary/20 p-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium mb-2">Insight #{index + 1}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {insight}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para valorar tu empresa?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Comienza ahora y obtén tu valoración especializada en minutos
            </p>
            <Button 
              size="lg" 
              onClick={() => {
                document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group"
            >
              Comenzar Valoración
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};