import React from 'react';
import { HomeLayout } from '@/shared';
import SectorHero from '@/components/SectorHero';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, FileText, Award } from 'lucide-react';

const Valoraciones = () => {
  return (
    <HomeLayout>
        <SectorHero
          sector="Valoraciones"
          title="Servicios de Valoración Empresarial"
          description="Expertos en valoración de empresas con metodologías reconocidas internacionalmente. Proporcionamos valoraciones precisas y objetivas para operaciones M&A, restructuraciones y toma de decisiones estratégicas."
          primaryButtonText="Solicitar Valoración"
          secondaryButtonText="Ver Metodologías"
          gradientFrom="from-blue-600"
          gradientTo="to-indigo-600"
        />
        
        {/* Methodologies Section */}
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Metodologías de Valoración
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Aplicamos las mejores prácticas internacionales en valoración empresarial
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Calculator,
                  title: "DCF - Flujos Descontados",
                  description: "Valoración basada en la capacidad de generación de flujos de caja futuros de la empresa."
                },
                {
                  icon: TrendingUp,
                  title: "Múltiplos Comparables",
                  description: "Análisis de múltiplos de empresas similares cotizadas y transacciones precedentes."
                },
                {
                  icon: FileText,
                  title: "Valor Patrimonial",
                  description: "Valoración de activos netos ajustados al valor de mercado y situación contable."
                },
                {
                  icon: Award,
                  title: "Métodos Mixtos",
                  description: "Combinación de metodologías para obtener un rango de valoración robusto y preciso."
                }
              ].map((item, index) => (
                <div key={index} className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              ¿Necesitas una valoración profesional?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Nuestros expertos te ayudarán a obtener una valoración precisa y objetiva
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="bg-background text-primary hover:bg-background/90">
                Solicitar Consulta
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Casos de Éxito
              </Button>
            </div>
          </div>
        </section>
    </HomeLayout>
  );
};

export default Valoraciones;