import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, GraduationCap, TrendingUp, Users, Building2, Globe } from 'lucide-react';

const stats = [
  { icon: TrendingUp, value: '100+', label: 'Search Funds activos', description: 'En España y Portugal' },
  { icon: Users, value: '€500M+', label: 'Capital desplegado', description: 'En los últimos 5 años' },
  { icon: Building2, value: '60+', label: 'Adquisiciones', description: 'Completadas exitosamente' },
  { icon: Globe, value: '#1', label: 'En Europa', description: 'Por número de operaciones' },
];

const businessSchools = [
  { name: 'IESE Business School', location: 'Barcelona/Madrid', highlight: 'Pionero en SF en Europa' },
  { name: 'IE Business School', location: 'Madrid', highlight: 'Programa de emprendimiento' },
  { name: 'ESADE', location: 'Barcelona', highlight: 'Ecosistema de inversores' },
];

const reasons = [
  {
    title: 'Tejido empresarial fragmentado',
    description: '99% de empresas son PYMEs, muchas sin sucesión clara',
  },
  {
    title: 'Generación de fundadores en jubilación',
    description: 'Baby boomers vendiendo empresas creadas en los 80-90',
  },
  {
    title: 'Business schools de prestigio',
    description: 'IESE, IE y ESADE forman searchers de alto nivel',
  },
  {
    title: 'Financiación accesible',
    description: 'Bancos familiarizados con el modelo SF',
  },
  {
    title: 'Marco legal favorable',
    description: 'Estructuras de M&A bien establecidas',
  },
  {
    title: 'Comunidad activa',
    description: 'AcEF y networking entre searchers',
  },
];

export const SearchFundsSpainEcosystem: React.FC = () => {
  return (
    <section id="espana" className="py-16 scroll-mt-24">
      <div className="mb-12">
        <h2 className="text-3xl font-normal text-foreground mb-4">
          España: Líder Europeo en Search Funds
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          España se ha consolidado como el principal hub europeo de Search Funds, 
          con un ecosistema maduro que combina talento, capital y oportunidades.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="text-center h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-foreground">{stat.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Two Columns */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Business Schools */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Business Schools Referentes</h3>
            </div>
            <div className="space-y-4">
              {businessSchools.map((school) => (
                <div 
                  key={school.name} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">{school.name}</div>
                    <div className="text-sm text-muted-foreground">{school.location}</div>
                    <div className="text-xs text-primary mt-1">{school.highlight}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Why Spain */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-6">¿Por qué España?</h3>
            <div className="grid gap-3">
              {reasons.map((reason, index) => (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">{reason.title}</div>
                    <div className="text-xs text-muted-foreground">{reason.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
