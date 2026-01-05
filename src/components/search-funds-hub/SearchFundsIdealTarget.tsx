import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  TrendingUp, 
  Users, 
  Building, 
  Shield, 
  Repeat,
  Target
} from 'lucide-react';

const characteristics = [
  {
    icon: TrendingUp,
    title: 'Facturación €2-15M',
    description: 'Rango óptimo que permite financiación y gestión directa',
  },
  {
    icon: Users,
    title: 'Base de clientes diversificada',
    description: 'Sin dependencia excesiva de un solo cliente (<20%)',
  },
  {
    icon: Repeat,
    title: 'Ingresos recurrentes',
    description: 'Modelos B2B con contratos estables y predecibles',
  },
  {
    icon: Building,
    title: 'Baja intensidad de capital',
    description: 'Negocios que no requieren grandes inversiones en activos',
  },
  {
    icon: Shield,
    title: 'Barreras de entrada',
    description: 'Ventajas competitivas difíciles de replicar',
  },
  {
    icon: Target,
    title: 'Oportunidades de mejora',
    description: 'Potencial de crecimiento y profesionalización',
  },
];

const preferredSectors = [
  'Software & SaaS',
  'Servicios empresariales',
  'Healthcare',
  'Educación',
  'Distribución especializada',
  'Servicios técnicos',
  'Logística',
  'Manufactura ligera',
];

const redFlags = [
  'Dependencia del fundador >80%',
  'Un solo cliente >30% facturación',
  'Sector en declive',
  'Alta rotación de personal',
  'Problemas legales pendientes',
  'Necesidad de CAPEX elevado',
];

export const SearchFundsIdealTarget: React.FC = () => {
  return (
    <section id="objetivo-ideal" className="py-16 scroll-mt-24">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          ¿Qué hace un buen objetivo de adquisición?
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          Los Search Funds buscan empresas con características específicas que 
          permitan una transición suave y creación de valor a largo plazo.
        </p>
      </div>

      {/* Characteristics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {characteristics.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Two Columns: Sectors & Red Flags */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Preferred Sectors */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Sectores Preferidos
            </h3>
            <div className="flex flex-wrap gap-2">
              {preferredSectors.map((sector) => (
                <Badge key={sector} variant="secondary" className="text-sm">
                  {sector}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Red Flags */}
        <Card className="border-amber-200 dark:border-amber-900">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Señales de Alerta
            </h3>
            <ul className="space-y-2">
              {redFlags.map((flag) => (
                <li key={flag} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
