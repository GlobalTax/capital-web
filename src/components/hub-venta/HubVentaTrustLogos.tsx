import React from 'react';
import { Shield, Award, Users, Building } from 'lucide-react';

const trustBadges = [
  {
    icon: Shield,
    label: 'Confidencialidad Garantizada',
  },
  {
    icon: Award,
    label: 'Asesores Certificados',
  },
  {
    icon: Users,
    label: '+500 Inversores en Red',
  },
  {
    icon: Building,
    label: '+100 Operaciones Cerradas',
  },
];

const HubVentaTrustLogos: React.FC = () => {
  return (
    <section className="py-8 bg-slate-100 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {trustBadges.map((badge, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 text-slate-600"
            >
              <badge.icon className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HubVentaTrustLogos;
