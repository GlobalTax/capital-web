import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Award, TrendingUp, Users } from 'lucide-react';

const AccountexAbout = () => {
  const stats = [
    {
      icon: Award,
      value: '15+',
      label: 'Años de experiencia',
    },
    {
      icon: TrendingUp,
      value: '200+',
      label: 'Operaciones completadas',
    },
    {
      icon: Users,
      value: '50+',
      label: 'Asesorías colaboradoras',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Capittal Transacciones
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg">
                En Capittal acompañamos a asesorías, despachos y empresas tecnológicas 
                en procesos de compraventa, integración y expansión.
              </p>
              <p className="text-lg">
                Te ayudamos a valorar, estructurar y ejecutar operaciones de M&A con 
                rigor financiero y enfoque estratégico, maximizando el valor de tu negocio.
              </p>
              <p className="text-lg">
                Nuestro equipo de expertos te guiará en cada paso del proceso, desde la 
                valoración inicial hasta el cierre de la operación.
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Icon className="w-8 h-8 text-primary mx-auto mb-4" />
                    <div className="text-4xl font-bold text-foreground mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AccountexAbout;
