import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User, Building2, Check, X } from 'lucide-react';

const models = [
  {
    icon: Users,
    title: 'Search Fund Tradicional',
    subtitle: 'Modelo Stanford',
    description: 'Múltiples inversores financian la búsqueda (€300-500K). El searcher recibe 20-30% del equity tras la adquisición.',
    pros: ['Menor riesgo personal', 'Red de mentores amplia', 'Modelo probado'],
    cons: ['Mayor dilución', 'Proceso más formal', 'Dependencia de inversores'],
  },
  {
    icon: User,
    title: 'Self-Funded',
    subtitle: 'Autofinanciado',
    description: 'El emprendedor financia la búsqueda con recursos propios. Mayor control y potencial de equity.',
    pros: ['Mayor control', 'Sin dilución en búsqueda', 'Flexibilidad total'],
    cons: ['Mayor riesgo personal', 'Recursos limitados', 'Sin red de apoyo'],
  },
  {
    icon: Building2,
    title: 'Single-Sponsor',
    subtitle: 'Un solo inversor',
    description: 'Un único inversor institucional o family office financia toda la operación.',
    pros: ['Decisiones rápidas', 'Relación directa', 'Términos flexibles'],
    cons: ['Dependencia de un inversor', 'Menos networking', 'Menor diversificación'],
  },
];

const comparisonData = [
  { aspect: 'Capital búsqueda', tradicional: '€300-500K', selfFunded: 'Propio', singleSponsor: 'Variable' },
  { aspect: 'Equity searcher', tradicional: '20-30%', selfFunded: '50-100%', singleSponsor: '25-40%' },
  { aspect: 'Nº inversores', tradicional: '10-20', selfFunded: '0', singleSponsor: '1' },
  { aspect: 'Duración búsqueda', tradicional: '18-24 meses', selfFunded: 'Variable', singleSponsor: '12-18 meses' },
  { aspect: 'Red de apoyo', tradicional: 'Amplia', selfFunded: 'Limitada', singleSponsor: 'Moderada' },
];

export const SearchFundsModels: React.FC = () => {
  return (
    <section id="modelos" className="py-16 scroll-mt-24">
      <div className="mb-12">
        <h2 className="text-3xl font-normal text-foreground mb-4">
          Los 3 Modelos de Search Funds
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          Existen diferentes estructuras para emprender a través de adquisición. 
          Cada modelo tiene sus ventajas según el perfil del emprendedor y sus recursos.
        </p>
      </div>

      {/* Model Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {models.map((model, index) => (
          <motion.div
            key={model.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <model.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{model.title}</CardTitle>
                <p className="text-sm text-primary font-medium">{model.subtitle}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{model.description}</p>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Ventajas</p>
                  {model.pros.map((pro) => (
                    <div key={pro} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{pro}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Consideraciones</p>
                  {model.cons.map((con) => (
                    <div key={con} className="flex items-center gap-2 text-sm">
                      <X className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{con}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparativa de Modelos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Aspecto</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Tradicional</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Self-Funded</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Single-Sponsor</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={row.aspect} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="py-3 px-4 font-medium text-foreground">{row.aspect}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">{row.tradicional}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">{row.selfFunded}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">{row.singleSponsor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
