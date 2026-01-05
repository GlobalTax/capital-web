import React from 'react';
import { motion } from 'framer-motion';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ClipboardCheck, Search, Handshake } from 'lucide-react';

const dealStages = [
  {
    id: 'loi',
    icon: FileText,
    title: 'Letter of Intent (LOI)',
    subtitle: 'Carta de intenciones',
    description: 'Documento no vinculante que establece los términos principales de la oferta.',
    details: [
      'Precio de compra propuesto (rango o cifra)',
      'Estructura de la transacción',
      'Periodo de exclusividad (60-90 días)',
      'Condiciones precedentes principales',
      'Calendario estimado',
    ],
    tips: 'La LOI debe ser lo suficientemente detallada para alinear expectativas, pero flexible para adaptarse durante la due diligence.',
  },
  {
    id: 'hots',
    icon: ClipboardCheck,
    title: 'Heads of Terms (HoTs)',
    subtitle: 'Términos principales',
    description: 'Documento más detallado que la LOI, común en operaciones más complejas.',
    details: [
      'Valoración y método de cálculo',
      'Ajustes de precio (working capital, deuda neta)',
      'Garantías y representaciones',
      'Periodo de transición del vendedor',
      'Cláusulas de no competencia',
      'Mecanismos de resolución de disputas',
    ],
    tips: 'Los HoTs suelen negociarse entre abogados y pueden llevar varias rondas de revisión.',
  },
  {
    id: 'dd',
    icon: Search,
    title: 'Due Diligence',
    subtitle: 'Proceso de verificación',
    description: 'Análisis exhaustivo de la empresa objetivo en múltiples dimensiones.',
    details: [
      'Due Diligence Financiera: Estados financieros, proyecciones, calidad de beneficios',
      'Due Diligence Legal: Contratos, litigios, propiedad intelectual',
      'Due Diligence Fiscal: Cumplimiento, contingencias, optimización',
      'Due Diligence Operativa: Procesos, equipo, sistemas',
      'Due Diligence Comercial: Mercado, clientes, competencia',
    ],
    tips: 'La due diligence típica dura 4-8 semanas y puede revelar ajustes de precio o condiciones adicionales.',
  },
  {
    id: 'spa',
    icon: Handshake,
    title: 'SPA (Share Purchase Agreement)',
    subtitle: 'Contrato de compraventa',
    description: 'Documento legal definitivo que formaliza la transacción.',
    details: [
      'Precio final y mecanismo de ajuste',
      'Representaciones y garantías del vendedor',
      'Cláusulas de indemnización',
      'Condiciones de cierre',
      'Obligaciones post-cierre',
      'Escrow y earn-outs (si aplica)',
    ],
    tips: 'El SPA es un documento complejo que requiere asesoramiento legal especializado en M&A.',
  },
];

export const SearchFundsDealStructure: React.FC = () => {
  return (
    <section id="estructura" className="py-16 scroll-mt-24">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Estructura de la Oferta
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          El proceso de adquisición sigue una estructura estandarizada que protege 
          tanto al comprador como al vendedor.
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {dealStages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <AccordionItem value={stage.id} className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <stage.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{stage.title}</h3>
                    <p className="text-sm text-muted-foreground">{stage.subtitle}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="pl-14 space-y-4">
                  <p className="text-muted-foreground">{stage.description}</p>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Elementos clave:</h4>
                    <ul className="space-y-2">
                      {stage.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">💡 Consejo: </span>
                        {stage.tips}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </section>
  );
};
