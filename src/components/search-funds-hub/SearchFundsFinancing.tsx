import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Wallet, Building2, Clock, RefreshCw } from 'lucide-react';

const financingTypes = [
  {
    icon: Wallet,
    title: 'Equity Financing',
    percentage: '30-50%',
    color: 'bg-primary',
    description: 'Capital aportado por el searcher e inversores',
    details: [
      'Inversores del search fund',
      'Capital propio del searcher',
      'Co-inversores en la transacción',
    ],
  },
  {
    icon: Building2,
    title: 'Debt Financing',
    percentage: '30-50%',
    color: 'bg-blue-500',
    description: 'Deuda bancaria o alternativa',
    details: [
      'Préstamo bancario senior',
      'Líneas de crédito',
      'Deuda mezzanine',
    ],
  },
  {
    icon: Clock,
    title: 'Vendor Financing',
    percentage: '10-30%',
    color: 'bg-amber-500',
    description: 'Pago diferido al vendedor',
    details: [
      'Pagarés a 2-5 años',
      'Subordinado a deuda senior',
      'Interés típico: 4-8%',
    ],
  },
  {
    icon: RefreshCw,
    title: 'Earn-out',
    percentage: '5-20%',
    color: 'bg-green-500',
    description: 'Pago condicionado a resultados',
    details: [
      'Vinculado a EBITDA o ingresos',
      'Periodo: 1-3 años',
      'Protege al comprador',
    ],
  },
];

const typicalStructure = [
  { name: 'Equity', value: 40, color: 'hsl(var(--primary))' },
  { name: 'Deuda Senior', value: 35, color: 'hsl(217, 91%, 60%)' },
  { name: 'Vendor Note', value: 15, color: 'hsl(45, 93%, 47%)' },
  { name: 'Earn-out', value: 10, color: 'hsl(142, 71%, 45%)' },
];

export const SearchFundsFinancing: React.FC = () => {
  return (
    <section id="financiacion" className="py-16 scroll-mt-24">
      <div className="mb-12">
        <h2 className="text-3xl font-normal text-foreground mb-4">
          Financiación de la Transacción
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          Las adquisiciones de Search Funds típicamente combinan múltiples fuentes 
          de financiación para optimizar el retorno y gestionar el riesgo.
        </p>
      </div>

      {/* Visual Structure */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Estructura Típica de Capital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Simple visual bar */}
            <div className="w-full md:w-1/2">
              <div className="h-8 rounded-full overflow-hidden flex">
                {typicalStructure.map((item) => (
                  <div
                    key={item.name}
                    className="h-full flex items-center justify-center text-xs font-medium text-white"
                    style={{ 
                      width: `${item.value}%`, 
                      backgroundColor: item.color,
                    }}
                  >
                    {item.value}%
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                {typicalStructure.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Key metrics */}
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">4-6x</div>
                <div className="text-sm text-muted-foreground">Múltiplo EBITDA</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">€2-10M</div>
                <div className="text-sm text-muted-foreground">Enterprise Value</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">3-4x</div>
                <div className="text-sm text-muted-foreground">Deuda/EBITDA</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">5-7 años</div>
                <div className="text-sm text-muted-foreground">Horizonte Exit</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financing Types */}
      <div className="grid md:grid-cols-2 gap-6">
        {financingTypes.map((type, index) => (
          <motion.div
            key={type.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${type.color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                    <type.icon className={`w-6 h-6 ${type.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{type.title}</h3>
                      <span className="text-sm font-bold text-primary">{type.percentage}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                    <ul className="space-y-1">
                      {type.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
