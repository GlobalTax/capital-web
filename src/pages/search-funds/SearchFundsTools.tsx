import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ClipboardCheck, FileSpreadsheet, ArrowRight, Scale } from 'lucide-react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { Button } from '@/components/ui/button';
import { SearchFundsFitCalculator } from '@/components/search-funds/SearchFundsFitCalculator';
import { SearchFundsComparator } from '@/components/search-funds/SearchFundsComparator';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo/schemas';

const tools = [
  {
    icon: Calculator,
    title: 'Calculadora de Valoración',
    description: 'Obtén una estimación inicial del valor de tu empresa basada en múltiplos de mercado.',
    href: '/lp/calculadora',
    cta: 'Calcular valoración',
  },
  {
    icon: ClipboardCheck,
    title: 'Test Exit-Ready',
    description: '¿Está tu empresa preparada para una venta? Evalúa los factores clave en 5 minutos.',
    href: '/recursos/test-exit-ready',
    cta: 'Hacer el test',
  },
  {
    icon: FileSpreadsheet,
    title: 'Calculadora Fiscal',
    description: 'Calcula el impacto fiscal de la venta de tu empresa y optimiza tu planificación.',
    href: '/lp/calculadora-fiscal',
    cta: 'Calcular impuestos',
  },
];

const SearchFundsTools = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout>
      <SEOHead
        title="Herramientas Search Funds | Calculadoras y Tests | Capittal"
        description="Herramientas gratuitas para Search Funds: calculadora de fit, comparador SF vs PE, valoración de empresas, test exit-ready y más. Evalúa si tu empresa es candidata."
        canonical="https://capittal.es/search-funds/recursos/herramientas"
        structuredData={getWebPageSchema('Herramientas Search Funds', 'Herramientas gratuitas para Search Funds: calculadora de fit, comparador SF vs PE, valoración de empresas y más.', 'https://capittal.es/search-funds/recursos/herramientas')}
      />

      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Herramientas</h1>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Calculadoras y tests interactivos para evaluar si tu empresa es candidata ideal para un Search Fund.
            </p>

            {/* Main Tool: Fit Calculator */}
            <section className="mb-16">
              <h2 className="text-2xl font-semibold mb-6">Calculadora de Fit para Search Funds</h2>
              <SearchFundsFitCalculator />
            </section>

            {/* Comparator: SF vs PE vs Traditional */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Comparador: Search Fund vs Private Equity vs M&A Tradicional</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Compara las características, ventajas y desventajas de cada modelo de adquisición para entender cuál encaja mejor con tu situación.
              </p>
              <SearchFundsComparator />
            </section>

            {/* Other Tools */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Otras Herramientas</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.title}
                      className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 rounded-lg bg-primary/10 inline-block mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                      <Button variant="outline" asChild className="w-full">
                        <Link to={tool.href}>
                          {tool.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsTools;
