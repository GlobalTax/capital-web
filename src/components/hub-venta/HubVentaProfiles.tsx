import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Users, Home, DollarSign, Rocket, FileCheck, ArrowRight } from 'lucide-react';
import { useHubVentaTracking } from '@/hooks/useHubVentaTracking';

const profiles = [
  {
    icon: Clock,
    title: 'Empresarios cerca de la jubilación',
    description: 'Planifica tu retiro con tranquilidad',
  },
  {
    icon: Users,
    title: 'Socios que quieren salir del negocio',
    description: 'Facilita la transición de participaciones',
  },
  {
    icon: Home,
    title: 'Empresas familiares sin sucesión clara',
    description: 'Encuentra la mejor solución para tu legado',
  },
  {
    icon: DollarSign,
    title: 'Negocios que necesitan un socio capitalista',
    description: 'Atraemos inversores estratégicos',
  },
  {
    icon: Rocket,
    title: 'Empresarios que buscan nuevos proyectos',
    description: 'Libera capital para tu próxima aventura',
  },
  {
    icon: FileCheck,
    title: 'Empresas con ofertas de compra recibidas',
    description: 'Maximiza el valor de las ofertas existentes',
  },
];

const HubVentaProfiles: React.FC = () => {
  const { trackCTAClick } = useHubVentaTracking();

  const scrollToForm = () => {
    trackCTAClick('profiles_cta');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs font-light uppercase tracking-widest text-slate-500 mb-4">
            Perfil de vendedor
          </p>
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900">
            ¿Es el Momento de Vender?
          </h2>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {profiles.map((profile, index) => (
            <div 
              key={index}
              className="group p-6 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all duration-300 cursor-pointer"
              onClick={scrollToForm}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <profile.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium text-slate-900 mb-2">
                {profile.title}
              </h3>
              <p className="text-sm text-slate-600">
                {profile.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            onClick={scrollToForm}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-base"
          >
            ¿Te identificas? Hablemos
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HubVentaProfiles;
