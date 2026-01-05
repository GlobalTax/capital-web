import { motion } from 'framer-motion';
import { GraduationCap, TrendingUp, Users, Building2 } from 'lucide-react';

const stats = [
  { icon: Users, value: '50+', label: 'Searchers activos en España' },
  { icon: Building2, value: '120+', label: 'Transacciones cerradas' },
  { icon: TrendingUp, value: '32.6%', label: 'IRR histórico medio' },
];

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
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Guías, herramientas, glosario y recursos para dominar el modelo de adquisición empresarial 
            que está transformando el mercado español.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center p-6 rounded-2xl bg-card border"
                >
                  <Icon className="h-8 w-8 text-primary mb-3" />
                  <span className="text-3xl font-bold mb-1">{stat.value}</span>
                  <span className="text-sm text-muted-foreground text-center">{stat.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
