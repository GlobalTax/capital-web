import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Briefcase, BarChart3 } from 'lucide-react';

const AccountexValueProps = () => {
  const valueProps = [
    {
      icon: Handshake,
      title: 'Colaboraciones con asesorías',
      description:
        'Establecemos alianzas estratégicas con despachos profesionales para identificar oportunidades de M&A entre sus clientes.',
      benefits: [
        'Red de colaboradores especializada',
        'Comisiones competitivas',
        'Soporte técnico completo',
      ],
    },
    {
      icon: Briefcase,
      title: 'Mandatos de venta y compra',
      description:
        'Gestionamos el proceso completo de transacción, desde la valoración hasta el cierre, con total confidencialidad.',
      benefits: [
        'Proceso estructurado',
        'Acceso a compradores cualificados',
        'Negociación profesional',
      ],
    },
    {
      icon: BarChart3,
      title: 'Valoraciones profesionales',
      description:
        'Realizamos análisis financieros rigurosos para determinar el valor real de tu empresa o la de tus clientes.',
      benefits: [
        'Metodología contrastada',
        'Informes detallados',
        'Soporte post-valoración',
      ],
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            ¿Cómo podemos ayudarte?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ofrecemos soluciones completas para asesorías y empresas que buscan 
            crecer a través de operaciones de M&A
          </p>
        </motion.div>

        {/* Value Proposition Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{prop.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{prop.description}</p>
                    <ul className="space-y-2">
                      {prop.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-start gap-2 text-sm"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AccountexValueProps;
