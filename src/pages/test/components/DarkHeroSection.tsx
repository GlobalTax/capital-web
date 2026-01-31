import React from 'react';
import { motion } from 'framer-motion';

interface StatItem {
  value: string;
  label: string;
}

const stats: StatItem[] = [
  { value: '€902M', label: 'Valor total asesorado' },
  { value: '98,7%', label: 'Tasa de éxito' },
  { value: '200+', label: 'Operaciones cerradas' },
  { value: '60+', label: 'Profesionales' },
];

const DarkHeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=1920&q=80)'
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 hero-portobello-overlay" />
      </div>

      {/* Content - Left aligned */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-12 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-3xl"
        >
          {/* Main Headline - Serif font */}
          <h1 className="font-serif-display text-white font-normal leading-[1.1] tracking-tight text-5xl md:text-6xl lg:text-7xl">
            Especialistas en
            <br />
            compraventa de empresas
          </h1>

          {/* Subtitle */}
          <p className="text-white/70 text-lg md:text-xl mt-8 max-w-lg leading-relaxed">
            Maximizamos el valor de tu empresa con un equipo multidisciplinar de más de 60 profesionales y enfoque orientado a resultados.
          </p>

          {/* Stats - Below subtitle, inline */}
          <div className="flex flex-wrap gap-12 md:gap-16 mt-16">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                className="text-left"
              >
                <div className="text-white text-4xl md:text-5xl font-light tracking-tight">
                  {stat.value}
                </div>
                <div className="text-white/50 text-sm mt-2 tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Slider indicators - Bottom right like Portobello */}
      <div className="absolute bottom-12 right-6 lg:right-12 flex items-center gap-3">
        <div className="w-12 h-0.5 bg-white" />
        <div className="w-12 h-0.5 bg-white/30" />
        <div className="w-12 h-0.5 bg-white/30" />
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-12 left-6 lg:left-12 text-white/50 text-xs tracking-[0.2em] uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        Scroll
      </motion.div>
    </section>
  );
};

export default DarkHeroSection;
