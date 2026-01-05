import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { GlossarySearch, GlossaryCard } from '@/components/search-funds-center';

const glossaryTerms = [
  {
    term: 'Search Fund',
    definition: 'Vehículo de inversión en el que un emprendedor (searcher) recauda capital de inversores para buscar, adquirir y operar una empresa establecida.',
    example: 'Un MBA de IESE lanza un Search Fund con 400K€ para encontrar una empresa industrial de 3-10M€ de facturación.',
    category: 'Estructura',
  },
  {
    term: 'Searcher',
    definition: 'El emprendedor que lidera el Search Fund. Busca la empresa, negocia la adquisición y luego la dirige como CEO.',
    category: 'Roles',
  },
  {
    term: 'LOI (Letter of Intent)',
    definition: 'Carta de intenciones que establece los términos principales de una transacción antes de la due diligence formal.',
    example: 'El LOI incluye precio indicativo de 5M€, estructura de pago y exclusividad de 60 días.',
    category: 'Documentos',
  },
  {
    term: 'Due Diligence',
    definition: 'Proceso de investigación exhaustiva de una empresa antes de su adquisición: financiera, legal, fiscal, comercial y operativa.',
    category: 'Proceso',
  },
  {
    term: 'EBITDA',
    definition: 'Earnings Before Interest, Taxes, Depreciation and Amortization. Métrica clave para valorar empresas en M&A.',
    example: 'Una empresa con 1M€ de EBITDA y múltiplo de 5x tendría una valoración de 5M€.',
    category: 'Financiero',
  },
  {
    term: 'Earn-out',
    definition: 'Pago diferido condicionado al cumplimiento de objetivos futuros. Parte del precio se paga según el rendimiento post-adquisición.',
    example: 'El 20% del precio (500K€) se paga en 2 años si la empresa mantiene un EBITDA superior a 800K€.',
    category: 'Financiación',
  },
  {
    term: 'Equity Rollover',
    definition: 'Cuando el vendedor reinvierte parte del precio de venta en acciones de la nueva empresa, manteniendo participación minoritaria.',
    example: 'El empresario vende el 80% pero reinvierte 300K€ para mantener un 15% del capital.',
    category: 'Financiación',
  },
  {
    term: 'Vendor Financing',
    definition: 'Financiación proporcionada por el vendedor, que acepta recibir parte del precio de forma diferida.',
    example: 'El vendedor financia 1M€ a pagar en 3 años al 5% de interés.',
    category: 'Financiación',
  },
  {
    term: 'SPA (Share Purchase Agreement)',
    definition: 'Contrato de compraventa de acciones. Documento legal definitivo que formaliza la transacción.',
    category: 'Documentos',
  },
  {
    term: 'Cap Table',
    definition: 'Tabla de capitalización que muestra la estructura de propiedad de una empresa: quién posee qué porcentaje.',
    category: 'Estructura',
  },
  {
    term: 'IRR (TIR)',
    definition: 'Internal Rate of Return / Tasa Interna de Retorno. Métrica de rentabilidad que considera el valor temporal del dinero.',
    example: 'Un Search Fund que multiplica x3 la inversión en 5 años tiene un IRR aproximado del 25%.',
    category: 'Financiero',
  },
  {
    term: 'Múltiplo de Salida',
    definition: 'El factor por el cual se multiplica el capital invertido al vender la empresa. Objetivo típico: 3-5x en 5-7 años.',
    category: 'Financiero',
  },
  {
    term: 'Self-Funded Search',
    definition: 'Modalidad donde el searcher financia la fase de búsqueda con recursos propios, sin inversores iniciales.',
    category: 'Estructura',
  },
  {
    term: 'Traditional Search',
    definition: 'Modelo Stanford clásico con capital de búsqueda de inversores y estructura de equity predefinida.',
    category: 'Estructura',
  },
  {
    term: 'Exclusividad',
    definition: 'Período durante el cual el vendedor no puede negociar con otros compradores. Típicamente 60-90 días.',
    category: 'Proceso',
  },
  {
    term: 'Teaser',
    definition: 'Documento breve y anónimo que presenta una oportunidad de inversión sin revelar la identidad de la empresa.',
    category: 'Documentos',
  },
  {
    term: 'CIM (Confidential Information Memorandum)',
    definition: 'Documento detallado que presenta la empresa en venta: historia, finanzas, operaciones, mercado y oportunidades.',
    category: 'Documentos',
  },
  {
    term: 'NDA (Non-Disclosure Agreement)',
    definition: 'Acuerdo de confidencialidad que los compradores potenciales firman antes de recibir información sensible.',
    category: 'Documentos',
  },
];

const SearchFundsGlossary = () => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredTerms = useMemo(() => {
    if (!searchTerm) return glossaryTerms;
    const lower = searchTerm.toLowerCase();
    return glossaryTerms.filter(
      (t) =>
        t.term.toLowerCase().includes(lower) ||
        t.definition.toLowerCase().includes(lower) ||
        t.category.toLowerCase().includes(lower)
    );
  }, [searchTerm]);

  const categories = [...new Set(glossaryTerms.map((t) => t.category))].sort();

  return (
    <UnifiedLayout>
      <Helmet>
        <title>Glosario M&A y Search Funds | Capittal</title>
        <meta 
          name="description" 
          content="Diccionario completo de términos M&A y Search Funds: LOI, EBITDA, Due Diligence, Earn-out y más. Definiciones claras con ejemplos prácticos." 
        />
        <link rel="canonical" href="https://capittal.es/search-funds/recursos/glosario" />
      </Helmet>

      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Glosario M&A y Search Funds</h1>
            <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
              Términos clave del mundo de las fusiones y adquisiciones explicados de forma clara y con ejemplos prácticos.
            </p>

            <GlossarySearch onSearch={setSearchTerm} />

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchTerm(cat)}
                  className="px-3 py-1 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  {cat}
                </button>
              ))}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-1 text-sm rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  Limpiar filtro
                </button>
              )}
            </div>

            <div className="grid gap-4">
              {filteredTerms.map((term) => (
                <GlossaryCard key={term.term} {...term} />
              ))}
              {filteredTerms.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No se encontraron términos que coincidan con "{searchTerm}".
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsGlossary;
