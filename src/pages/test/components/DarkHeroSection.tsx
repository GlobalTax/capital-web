import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface StatItem {
  value: string;
  label: string;
}

const stats: StatItem[] = [
  { value: '€902M', label: 'valor total asesorado' },
  { value: '200+', label: 'operaciones cerradas' },
  { value: '98,7%', label: 'tasa de éxito' },
  { value: '10+', label: 'años de experiencia' },
];

const DarkHeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-[hsl(var(--dark-bg))]">
      {/* Stats Bar - Top */}
      <div className="absolute top-24 left-0 right-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center md:text-left"
              >
                <div className="text-white text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[hsl(var(--dark-text-secondary))] text-sm mt-2 tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Center */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-4xl"
        >
          {/* Main Headline */}
          <h1 className="text-white font-normal leading-[1.1] tracking-tight" 
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Vende tu empresa
            <br />
            <span className="text-[hsl(var(--dark-text-secondary))]">con el máximo valor</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[hsl(var(--dark-text-secondary))] text-lg md:text-xl mt-8 max-w-2xl leading-relaxed">
            Asesoramos operaciones de M&A en el middle market español. 
            Maximizamos el valor de tu empresa con un proceso confidencial y profesional.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <Link
              to="/lp/calculadora"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[hsl(var(--dark-bg))] text-base font-normal tracking-wide transition-all hover:bg-white/90"
            >
              Valorar mi empresa
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 border border-[hsl(var(--dark-border))] text-white text-base font-normal tracking-wide transition-all hover:border-white/50"
            >
              Hablar con un asesor
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--dark-border))] to-transparent" />
    </section>
  );
};

export default DarkHeroSection;
