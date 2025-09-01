import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const VentaEmpresasValuationFactors = () => {
  const factors = [
    {
      title: 'Análisis Financiero',
      description: 'Valoración profunda de rentabilidad, flujo de caja y proyecciones de crecimiento',
      percentage: '35%',
      items: ['EBITDA y márgenes', 'Crecimiento histórico', 'Predictibilidad ingresos', 'Estructura de costes']
    },
    {
      title: 'Posición Competitiva',
      description: 'Análisis del mercado, competencia y ventajas competitivas sostenibles',
      percentage: '25%',
      items: ['Cuota de mercado', 'Diferenciación', 'Barreras entrada', 'Fidelidad clientes']
    },
    {
      title: 'Gestión y Equipos',
      description: 'Valoración del equipo directivo y la estructura organizacional',
      percentage: '20%',
      items: ['Calidad management', 'Dependencia fundador', 'Talento clave', 'Cultura empresarial']
    },
    {
      title: 'Riesgos y Diversificación',
      description: 'Análisis de concentración de riesgos y diversificación del negocio',
      percentage: '20%',
      items: ['Concentración clientes', 'Diversificación productos', 'Riesgos operativos', 'Regulación sectorial']
    }
  ];

  return (
    <section id="factores-valoracion" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Factores Clave de Valoración
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Nuestro proceso de valoración analiza múltiples dimensiones para determinar 
            el valor real y el potencial de tu empresa en el mercado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {factors.map((factor, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-muted rounded-lg p-3 w-12 h-12 flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{index + 1}</span>
                </div>
                <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                  {factor.percentage}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {factor.title}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4">
                {factor.description}
              </p>
              
              <div className="space-y-2">
                {factor.items.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            ¿Quieres conocer el valor de tu empresa?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Nuestros expertos realizarán una valoración profesional considerando todos los factores 
            relevantes para tu sector y situación específica.
          </p>
          <InteractiveHoverButton 
            text="Solicitar Valoración Gratuita"
            variant="primary"
            size="lg"
            onClick={() => {
              const ctaElement = document.getElementById('contacto');
              if (ctaElement) {
                ctaElement.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasValuationFactors;