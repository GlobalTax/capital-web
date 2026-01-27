import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calculator, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const SearchFundsHubHero: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <BookOpen className="w-4 h-4" />
            Centro de Recursos
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            Guía Completa de{' '}
            <span className="text-primary">Search Funds</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Todo lo que necesitas saber sobre el modelo de adquisición empresarial 
            que está transformando el mercado español. Desde conceptos básicos hasta 
            estructuración avanzada de operaciones.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-10"
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">32.6%</div>
              <div className="text-xs md:text-sm text-muted-foreground">IRR Histórico</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">5x</div>
              <div className="text-xs md:text-sm text-muted-foreground">Retorno Medio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">#1</div>
              <div className="text-xs md:text-sm text-muted-foreground">España en Europa</div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="gap-2">
              <Link to="/servicios/search-funds">
                Evaluar mi empresa
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/lp/calculadora-web">
                <Calculator className="w-4 h-4" />
                Calculadora de Valoración
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
