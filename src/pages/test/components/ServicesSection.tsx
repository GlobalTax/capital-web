import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Search, FileCheck, Shield, Users, BarChart3 } from 'lucide-react';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Venta de empresas',
    description: 'Maximizamos el valor de tu empresa en el proceso de venta con una metodología probada y acceso a compradores cualificados.',
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: 'Valoración de empresas',
    description: 'Informes de valoración profesionales basados en múltiples metodologías y comparables de mercado.',
  },
  {
    icon: <Search className="w-8 h-8" />,
    title: 'Due Diligence',
    description: 'Análisis exhaustivo financiero, legal y operativo para operaciones de compraventa.',
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Planificación fiscal',
    description: 'Optimización de la estructura fiscal de la operación para maximizar el retorno neto.',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Búsqueda de compradores',
    description: 'Acceso a nuestra red de más de 2.000 inversores y grupos empresariales cualificados.',
  },
  {
    icon: <FileCheck className="w-8 h-8" />,
    title: 'Reestructuraciones',
    description: 'Asesoramiento en procesos de reestructuración financiera y operativa.',
  },
];

const ServicesSection: React.FC = () => {
  return (
    <section id="servicios" className="py-24 md:py-32 bg-[hsl(0,0%,7%)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20"
        >
          <span className="text-white/40 text-sm tracking-[0.2em] uppercase mb-4 block">
            Servicios
          </span>
          <h2 className="font-serif-display text-white text-4xl md:text-5xl lg:text-6xl leading-tight">
            Soluciones integrales
            <br />
            <span className="text-white/60">para tu empresa</span>
          </h2>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-[hsl(0,0%,7%)] p-8 md:p-10 hover:bg-[hsl(0,0%,9%)] transition-colors duration-300"
            >
              {/* Icon */}
              <div className="text-white/40 group-hover:text-white transition-colors duration-300 mb-6">
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="font-serif-display text-white text-xl md:text-2xl mb-4">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-white/50 text-sm leading-relaxed">
                {service.description}
              </p>

              {/* Hover indicator */}
              <div className="mt-8 flex items-center gap-2 text-white/30 group-hover:text-white/60 transition-colors duration-300">
                <span className="text-xs tracking-[0.15em] uppercase">Saber más</span>
                <svg 
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 md:mt-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-12 border-t border-white/10"
        >
          <p className="text-white/50 text-lg max-w-md">
            ¿Necesitas asesoramiento personalizado para tu operación?
          </p>
          <button className="px-8 py-4 bg-white text-black text-sm font-medium tracking-wide hover:bg-white/90 transition-colors">
            Contactar
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
