import { Check, X, Minus } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  searchFund: string | boolean;
  privateEquity: string | boolean;
  traditional: string | boolean;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: 'Tamaño típico de empresa',
    searchFund: '€1-15M facturación',
    privateEquity: '€50-500M facturación',
    traditional: 'Variable',
  },
  {
    feature: 'EBITDA objetivo',
    searchFund: '€500K - €2M',
    privateEquity: '€5M - €50M+',
    traditional: 'Variable',
  },
  {
    feature: 'Múltiplo de entrada',
    searchFund: '4-6x EBITDA',
    privateEquity: '7-12x EBITDA',
    traditional: '3-8x EBITDA',
  },
  {
    feature: 'Rol del comprador',
    searchFund: 'CEO operativo 100%',
    privateEquity: 'Board + gestión profesional',
    traditional: 'Variable',
  },
  {
    feature: 'Horizonte temporal',
    searchFund: '5-7 años',
    privateEquity: '3-5 años',
    traditional: 'Largo plazo / indefinido',
  },
  {
    feature: 'Financiación típica',
    searchFund: '60-70% deuda + equity',
    privateEquity: '50-70% deuda + equity',
    traditional: '0-50% deuda',
  },
  {
    feature: 'Experiencia del comprador',
    searchFund: 'MBA sin experiencia operativa',
    privateEquity: 'Equipo profesional experimentado',
    traditional: 'Empresario con o sin experiencia',
  },
  {
    feature: 'Transición del fundador',
    searchFund: true,
    privateEquity: true,
    traditional: false,
  },
  {
    feature: 'Continuidad del equipo',
    searchFund: true,
    privateEquity: true,
    traditional: 'Variable',
  },
  {
    feature: 'Rapidez del proceso',
    searchFund: '6-18 meses',
    privateEquity: '3-9 meses',
    traditional: '3-24 meses',
  },
  {
    feature: 'Competencia por deals',
    searchFund: 'Baja-Media',
    privateEquity: 'Alta',
    traditional: 'Baja',
  },
  {
    feature: 'Retorno esperado (IRR)',
    searchFund: '25-35%',
    privateEquity: '20-25%',
    traditional: 'Variable',
  },
];

const prosConsData = {
  searchFund: {
    pros: [
      'Transición ordenada con el fundador',
      'Menor competencia por empresas',
      'Enfoque en empresas más pequeñas',
      'CEO comprometido al 100%',
      'Preserva cultura y equipo',
    ],
    cons: [
      'Searcher sin experiencia operativa previa',
      'Proceso de búsqueda largo (1-2 años)',
      'Capital limitado para crecimiento',
      'Dependencia del searcher individual',
    ],
  },
  privateEquity: {
    pros: [
      'Recursos abundantes para crecimiento',
      'Red de contactos y expertise',
      'Procesos profesionalizados',
      'Capacidad de add-on acquisitions',
      'Track record demostrable',
    ],
    cons: [
      'Múltiplos de entrada más altos',
      'Presión por resultados a corto plazo',
      'Menor personalización',
      'Puede no encajar con empresas pequeñas',
    ],
  },
  traditional: {
    pros: [
      'Control total del comprador',
      'Flexibilidad en términos',
      'Sin presión de inversores externos',
      'Puede mantener legacy familiar',
      'Negociación directa',
    ],
    cons: [
      'Acceso limitado a financiación',
      'Sin soporte post-adquisición',
      'Riesgo concentrado',
      'Menor sofisticación en el proceso',
    ],
  },
};

const CellValue = ({ value }: { value: string | boolean }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-green-600 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-red-500 mx-auto" />
    );
  }
  if (value === 'Variable') {
    return <Minus className="h-5 w-5 text-muted-foreground mx-auto" />;
  }
  return <span className="text-sm">{value}</span>;
};

export const SearchFundsComparator = () => {
  return (
    <div className="space-y-8">
      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-4 font-medium text-sm">Característica</th>
              <th className="text-center p-4 font-medium text-sm bg-primary/10">
                <span className="text-primary">Search Fund</span>
              </th>
              <th className="text-center p-4 font-medium text-sm">Private Equity</th>
              <th className="text-center p-4 font-medium text-sm">M&A Tradicional</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, idx) => (
              <tr key={row.feature} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                <td className="p-4 text-sm font-medium">{row.feature}</td>
                <td className="p-4 text-center bg-primary/5">
                  <CellValue value={row.searchFund} />
                </td>
                <td className="p-4 text-center">
                  <CellValue value={row.privateEquity} />
                </td>
                <td className="p-4 text-center">
                  <CellValue value={row.traditional} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pros and Cons Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Search Fund */}
        <div className="rounded-xl border-2 border-primary/30 overflow-hidden">
          <div className="bg-primary/10 p-4">
            <h4 className="font-semibold text-primary">Search Fund</h4>
            <p className="text-xs text-muted-foreground mt-1">Ideal para empresas €1-15M</p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wide">Ventajas</p>
              <ul className="space-y-2">
                {prosConsData.searchFund.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">Desventajas</p>
              <ul className="space-y-2">
                {prosConsData.searchFund.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Private Equity */}
        <div className="rounded-xl border overflow-hidden">
          <div className="bg-muted/50 p-4">
            <h4 className="font-semibold">Private Equity</h4>
            <p className="text-xs text-muted-foreground mt-1">Ideal para empresas €50M+</p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wide">Ventajas</p>
              <ul className="space-y-2">
                {prosConsData.privateEquity.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">Desventajas</p>
              <ul className="space-y-2">
                {prosConsData.privateEquity.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Traditional M&A */}
        <div className="rounded-xl border overflow-hidden">
          <div className="bg-muted/50 p-4">
            <h4 className="font-semibold">M&A Tradicional</h4>
            <p className="text-xs text-muted-foreground mt-1">Comprador individual/estratégico</p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wide">Ventajas</p>
              <ul className="space-y-2">
                {prosConsData.traditional.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">Desventajas</p>
              <ul className="space-y-2">
                {prosConsData.traditional.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="p-4 rounded-xl bg-muted/30 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">¿No sabes cuál es la mejor opción para tu empresa?</strong>{' '}
          Cada modelo tiene sus ventajas dependiendo del tamaño, sector y objetivos del vendedor. 
          Un Search Fund suele ser ideal para empresas rentables entre €1-15M de facturación donde 
          el fundador busca una transición ordenada y preservar el legado de la empresa.
        </p>
      </div>
    </div>
  );
};
