import React from 'react';
import { motion } from 'framer-motion';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import aboutFirmImage from '@/assets/test/about-firm.jpg';

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 902, suffix: 'M', prefix: '€', label: 'Valor asesorado' },
  { value: 200, suffix: '+', label: 'Operaciones' },
  { value: 98, suffix: '%', label: 'Tasa de éxito' },
  { value: 60, suffix: '+', label: 'Profesionales' },
];

const StatCounter: React.FC<StatItem & { delay: number }> = ({
  value,
  suffix,
  prefix = '',
  label,
  delay,
}) => {
  const { count, ref } = useCountAnimation(value, 2000 + delay, '');

  return (
    <div ref={ref} className="text-center md:text-left">
      <div className="text-foreground text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
        {prefix}{count}{suffix}
      </div>
      <div className="text-muted-foreground text-sm mt-2 tracking-wide uppercase">
        {label}
      </div>
    </div>
  );
};

const LaFirmaSection: React.FC = () => {
  return (
    <section id="la-firma" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-muted-foreground/60 text-sm tracking-[0.2em] uppercase block mb-4">
            La Firma
          </span>
          <h2 className="font-serif text-foreground text-4xl md:text-5xl lg:text-6xl leading-tight">
            Confianza y experiencia
            <br />
            <span className="text-muted-foreground">desde 2008</span>
          </h2>
        </motion.div>

        {/* Content Grid - 50/50 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={aboutFirmImage}
                alt="Equipo Capittal en reunión"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-border -z-10 hidden lg:block" />
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-6">
              Desde 2008, acompañamos a empresarios en los momentos más importantes de sus trayectorias empresariales. Nuestra misión es maximizar el valor de cada operación con un enfoque personalizado y resultados medibles.
            </p>
            <p className="text-muted-foreground/80 text-base leading-relaxed mb-8">
              Combinamos experiencia sectorial, metodología probada y una red global de más de 2.000 contactos cualificados. Cada proyecto es único y recibe la dedicación de un equipo multidisciplinar comprometido con tu éxito.
            </p>

            {/* Values */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="border-l-2 border-border pl-4">
                <h4 className="text-foreground font-medium mb-1">Confidencialidad</h4>
                <p className="text-muted-foreground text-sm">Máxima discreción en cada operación</p>
              </div>
              <div className="border-l-2 border-border pl-4">
                <h4 className="text-foreground font-medium mb-1">Independencia</h4>
                <p className="text-muted-foreground text-sm">Asesoramiento objetivo y transparente</p>
              </div>
            </div>

            {/* CTA */}
            <a
              href="/equipo"
              className="inline-flex items-center gap-3 text-foreground text-sm font-medium tracking-wide hover:text-muted-foreground transition-colors group"
            >
              Conocer al equipo
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mt-20 pt-16 border-t border-border"
        >
          {stats.map((stat, index) => (
            <StatCounter key={stat.label} {...stat} delay={index * 200} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LaFirmaSection;
