import { motion } from 'framer-motion';
import { Check, X, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonRow {
  aspect: string;
  searchFund: { value: string; positive: boolean | null };
  privateEquity: { value: string; positive: boolean | null };
  traditional: { value: string; positive: boolean | null };
}

const comparisonData: ComparisonRow[] = [
  {
    aspect: 'Tamaño típico de empresa',
    searchFund: { value: '€1M - €15M facturación', positive: true },
    privateEquity: { value: '€20M+ facturación', positive: null },
    traditional: { value: 'Variable', positive: null },
  },
  {
    aspect: 'Precio de venta',
    searchFund: { value: '4-7x EBITDA', positive: true },
    privateEquity: { value: '5-8x EBITDA', positive: true },
    traditional: { value: 'Variable, a menudo menor', positive: false },
  },
  {
    aspect: 'Tiempo del proceso',
    searchFund: { value: '6-12 meses', positive: true },
    privateEquity: { value: '3-6 meses', positive: true },
    traditional: { value: '12-24+ meses', positive: false },
  },
  {
    aspect: 'Compromiso del comprador',
    searchFund: { value: 'CEO a tiempo completo', positive: true },
    privateEquity: { value: 'Gestión profesional externa', positive: null },
    traditional: { value: 'Depende del comprador', positive: null },
  },
  {
    aspect: 'Continuidad del equipo',
    searchFund: { value: 'Prioridad máxima', positive: true },
    privateEquity: { value: 'Reestructuración común', positive: false },
    traditional: { value: 'Incierta', positive: null },
  },
  {
    aspect: 'Transición del fundador',
    searchFund: { value: 'Gradual, 6-12 meses', positive: true },
    privateEquity: { value: 'Rol limitado', positive: null },
    traditional: { value: 'Salida inmediata típica', positive: false },
  },
  {
    aspect: 'Relación con comprador',
    searchFund: { value: 'Personal y directa', positive: true },
    privateEquity: { value: 'Institucional', positive: null },
    traditional: { value: 'Variable', positive: null },
  },
  {
    aspect: 'Confidencialidad',
    searchFund: { value: 'Alta - proceso discreto', positive: true },
    privateEquity: { value: 'Media - procesos amplios', positive: null },
    traditional: { value: 'Baja - exposición al mercado', positive: false },
  },
];

const StatusIcon = ({ positive }: { positive: boolean | null }) => {
  if (positive === true) {
    return <Check className="w-4 h-4 text-green-600" />;
  } else if (positive === false) {
    return <X className="w-4 h-4 text-red-500" />;
  }
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

export const SearchFundsComparison = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Compara tus opciones de venta
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entiende las diferencias clave entre vender a un Search Fund, Private Equity o mediante una venta tradicional.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left p-4 bg-slate-50 font-semibold text-foreground rounded-tl-lg">
                  Aspecto
                </th>
                <th className="p-4 bg-primary text-primary-foreground font-semibold">
                  <div className="flex items-center justify-center gap-2">
                    <span>Search Fund</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Recomendado</span>
                  </div>
                </th>
                <th className="p-4 bg-slate-100 font-semibold text-foreground">
                  Private Equity
                </th>
                <th className="p-4 bg-slate-50 font-semibold text-foreground rounded-tr-lg">
                  Venta Tradicional
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <motion.tr
                  key={row.aspect}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'border-b border-border/50',
                    index === comparisonData.length - 1 && 'border-b-0'
                  )}
                >
                  <td className="p-4 font-medium text-foreground bg-slate-50/50">
                    {row.aspect}
                  </td>
                  <td className="p-4 bg-primary/5 border-x-2 border-primary/20">
                    <div className="flex items-center justify-center gap-2">
                      <StatusIcon positive={row.searchFund.positive} />
                      <span className="text-sm text-foreground">{row.searchFund.value}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <StatusIcon positive={row.privateEquity.positive} />
                      <span className="text-sm text-muted-foreground">{row.privateEquity.value}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center bg-slate-50/30">
                    <div className="flex items-center justify-center gap-2">
                      <StatusIcon positive={row.traditional.positive} />
                      <span className="text-sm text-muted-foreground">{row.traditional.value}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Los Search Funds destacan especialmente en empresas de €1M-€15M de facturación con EBITDA positivo
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchFundsComparison;
