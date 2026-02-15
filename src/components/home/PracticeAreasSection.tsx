import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import serviceVenta from '@/assets/test/service-venta.jpg';
import serviceValoracion from '@/assets/test/service-valoracion.jpg';
import serviceDueDiligence from '@/assets/test/service-due-diligence.jpg';
import serviceFiscal from '@/assets/test/service-fiscal.jpg';

interface Service {
  image: string;
  title: string;
  description: string;
  href: string;
}

const fallbackServices: Service[] = [
  {
    image: serviceVenta,
    title: 'Venta de empresas',
    description: 'Maximizamos el valor de tu empresa en el proceso de venta con una metodología probada y acceso a compradores cualificados.',
    href: '/servicios/venta-empresas',
  },
  {
    image: serviceValoracion,
    title: 'Valoración de empresas',
    description: 'Informes de valoración profesionales basados en múltiples metodologías y comparables de mercado.',
    href: '/servicios/valoracion',
  },
  {
    image: serviceDueDiligence,
    title: 'Due Diligence',
    description: 'Análisis exhaustivo financiero, legal y operativo para operaciones de compraventa.',
    href: '/servicios/due-diligence',
  },
  {
    image: serviceFiscal,
    title: 'Planificación fiscal',
    description: 'Optimización de la estructura fiscal de la operación para maximizar el retorno neto.',
    href: '/servicios/planificacion-fiscal',
  },
];

const fallbackImageMap: Record<string, string> = {
  'Venta de empresas': serviceVenta,
  'Valoración de empresas': serviceValoracion,
  'Due Diligence': serviceDueDiligence,
  'Planificación fiscal': serviceFiscal,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const PracticeAreasSection: React.FC = () => {
  const { data: dbCards } = useQuery({
    queryKey: ['practice-area-cards-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_area_cards')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const services: Service[] = dbCards && dbCards.length > 0
    ? dbCards.map(card => ({
        image: card.image_url || fallbackImageMap[card.title] || serviceVenta,
        title: card.title,
        description: card.description,
        href: card.href,
      }))
    : fallbackServices;

  return (
    <section id="servicios" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20"
        >
          <span className="text-foreground/60 text-sm tracking-[0.2em] uppercase mb-4 block">
            Áreas de práctica
          </span>
          <h2 className="font-serif text-foreground text-4xl md:text-5xl lg:text-6xl leading-tight">
            Soluciones integrales
            <br />
            <span className="text-foreground">para tu empresa</span>
          </h2>
        </motion.div>

        {/* Services Grid - 2x2 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {services.map((service) => (
            <motion.a
              key={service.title}
              href={service.href}
              variants={cardVariants}
              className="group relative overflow-hidden bg-muted aspect-[4/3] md:aspect-[16/10] cursor-pointer block rounded-lg"
            >
              {/* Background Image */}
              <img
                src={service.image}
                alt={`Servicio de ${service.title} - Capittal`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                width={800}
                height={500}
                loading="lazy"
                decoding="async"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <h3 className="font-serif text-white text-2xl md:text-3xl mb-3 group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                  {service.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  {service.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center gap-2 text-white/60 group-hover:text-white transition-colors duration-300">
                  <span className="text-xs tracking-[0.15em] uppercase">Saber más</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 md:mt-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-12 border-t border-border"
        >
          <p className="text-foreground/80 text-lg max-w-md">
            ¿Necesitas asesoramiento personalizado para tu operación?
          </p>
          <a
            href="#contacto"
            className="px-8 py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-colors"
          >
            Contactar
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default PracticeAreasSection;
