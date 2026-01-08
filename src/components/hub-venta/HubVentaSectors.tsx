import React from 'react';
import { 
  Factory, 
  Cpu, 
  Truck, 
  ShoppingBag, 
  Briefcase, 
  Building2, 
  UtensilsCrossed, 
  Heart,
  Leaf,
  Zap
} from 'lucide-react';

const sectors = [
  { icon: Factory, name: 'Industria y Manufactura' },
  { icon: Cpu, name: 'Tecnología y Software' },
  { icon: Truck, name: 'Distribución y Logística' },
  { icon: ShoppingBag, name: 'Retail y Consumo' },
  { icon: Briefcase, name: 'Servicios Profesionales' },
  { icon: Building2, name: 'Construcción e Inmobiliario' },
  { icon: UtensilsCrossed, name: 'Alimentación y Hostelería' },
  { icon: Heart, name: 'Sanidad y Farma' },
  { icon: Leaf, name: 'Medio Ambiente' },
  { icon: Zap, name: 'Energía' },
];

const HubVentaSectors: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs font-light uppercase tracking-widest text-slate-500 mb-4">
            Especialización sectorial
          </p>
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900">
            Sectores Donde Operamos
          </h2>
        </div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sectors.map((sector, index) => (
            <div 
              key={index}
              className="group flex flex-col items-center p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <sector.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">
                {sector.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HubVentaSectors;
