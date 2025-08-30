import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Badge } from '@/components/ui/badge';

export const EnhancedHeroSection = () => {
  const companies = [
    { name: 'TechCorp Solutions', value: '€12.5M', change: '+8.2%', color: 'bg-green-500' },
    { name: 'Industrial Partners', value: '€25.8M', change: '+12.4%', color: 'bg-blue-500' },
    { name: 'Digital Ventures', value: '€18.3M', change: '+6.1%', color: 'bg-purple-500' }
  ];

  const trustedLogos = [
    'astro', 'ARC', 'descript', 'MERCURY', 'ramp', 'Retool'
  ];

  return (
    <div className="bg-background">
      {/* Main Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Content */}
            <div className="space-y-8">
              <Badge className="bg-primary text-primary-foreground px-4 py-1.5">
                Líderes en M&A desde 2008
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Especialistas en compraventa de empresas
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Maximizamos el valor de tu empresa con resultados garantizados
              </p>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-8 py-8">
                <div>
                  <div className="text-4xl font-bold text-foreground">€1.0B+</div>
                  <div className="text-muted-foreground">Valor gestionado</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-foreground">95%</div>
                  <div className="text-muted-foreground">Tasa de éxito</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <InteractiveHoverButton 
                  text="Valorar mi empresa"
                  variant="primary"
                  size="lg"
                />
                <InteractiveHoverButton 
                  text="Ver Casos de Éxito"
                  variant="outline"
                  size="lg"
                />
              </div>
            </div>

            {/* Right Capital Market Panel */}
            <div className="bg-card border rounded-lg shadow-sm">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-lg font-medium">Capital Market</h3>
              </div>
              
              {/* Companies List */}
              <div className="p-6 space-y-4">
                {companies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${company.color}`}></div>
                      <div>
                        <div className="font-medium text-foreground">{company.name}</div>
                        <div className="text-sm text-muted-foreground">{company.value}</div>
                      </div>
                    </div>
                    <div className="text-green-600 font-medium text-sm">
                      {company.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-lg font-medium text-muted-foreground">Confían en Nosotros</h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
            {trustedLogos.map((logo, index) => (
              <div key={index} className="text-lg font-bold text-muted-foreground uppercase tracking-wider">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedHeroSection;