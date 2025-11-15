import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useCountAnimation } from '@/hooks/useCountAnimation';

const stats = [
  { 
    id: 1,
    value: 50, 
    label: "Colaboradores Activos", 
    suffix: "+" 
  },
  { 
    id: 2,
    value: 150, 
    label: "Deals Completados", 
    suffix: "+" 
  },
  { 
    id: 3,
    value: 98, 
    label: "Satisfacción", 
    suffix: "%" 
  },
  { 
    id: 4,
    value: 15, 
    label: "Años Experiencia Promedio", 
    suffix: "" 
  }
];

const StatCard = ({ stat, delay }: { stat: typeof stats[0], delay: number }) => {
  const { count, ref } = useCountAnimation(stat.value, 2000 + delay, stat.suffix);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 text-white">
        {count}
      </div>
      <div className="text-sm md:text-base text-slate-300 font-medium">
        {stat.label}
      </div>
    </motion.div>
  );
};

export const ImpactStats = () => {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Números que hablan por sí solos
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Únete a una comunidad en crecimiento de expertos en M&A
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <StatCard 
              key={stat.id} 
              stat={stat} 
              delay={index * 200} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
