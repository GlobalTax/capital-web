import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export const ResourceCenterHero = () => {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
          >
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">Centro de Recursos</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            Todo sobre{' '}
            <span className="text-primary">Search Funds</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Guías, herramientas, glosario y recursos para dominar el modelo de adquisición empresarial 
            que está transformando el mercado español.
          </motion.p>
        </div>
      </div>
    </section>
  );
};
