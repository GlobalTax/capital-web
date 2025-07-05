import React from 'react';

const KPIBar = () => {
  const kpis = [
    { value: '20+', label: 'operaciones completadas' },
    { value: '300 M€', label: 'valor agregado' },
    { value: '10', label: 'años de experiencia' }
  ];

  const logos = [
    { name: 'Cliente 1', url: '/placeholder-logo-1.svg' },
    { name: 'Cliente 2', url: '/placeholder-logo-2.svg' },
    { name: 'Cliente 3', url: '/placeholder-logo-3.svg' },
    { name: 'Cliente 4', url: '/placeholder-logo-4.svg' },
    { name: 'Cliente 5', url: '/placeholder-logo-5.svg' },
    { name: 'Cliente 6', url: '/placeholder-logo-6.svg' }
  ];

  return (
    <section className="py-16 bg-[hsl(var(--muted))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* KPI Stats */}
        <div className="mb-16">
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {kpis.map((kpi, index) => (
              <li key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))]">
                  {kpi.value}
                </div>
                <div className="text-[hsl(var(--muted-foreground))] text-sm uppercase tracking-wider">
                  {kpi.label}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Client Logos Carousel */}
        <div className="text-center">
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-8">
            Confianza de empresas líderes
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 hover:opacity-80 transition-opacity duration-300">
            {logos.map((logo, index) => (
              <div 
                key={index} 
                className="w-24 h-12 bg-[hsl(var(--border))] rounded-lg flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
              >
                <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KPIBar;