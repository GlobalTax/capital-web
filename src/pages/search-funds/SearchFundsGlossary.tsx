import { useEffect, useState, useMemo } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { GlossarySearch, GlossaryCard } from '@/components/search-funds-center';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo/schemas';

const glossaryTerms = [
  // === ESTRUCTURA ===
  {
    term: 'Search Fund',
    definition: 'Vehículo de inversión en el que un emprendedor (searcher) recauda capital de inversores para buscar, adquirir y operar una empresa establecida.',
    example: 'Un MBA de IESE lanza un Search Fund con 400K€ para encontrar una empresa industrial de 3-10M€ de facturación.',
    category: 'Estructura',
  },
  {
    term: 'Traditional Search',
    definition: 'Modelo Stanford clásico con capital de búsqueda de inversores y estructura de equity predefinida.',
    category: 'Estructura',
  },
  {
    term: 'Self-Funded Search',
    definition: 'Modalidad donde el searcher financia la fase de búsqueda con recursos propios, sin inversores iniciales.',
    category: 'Estructura',
  },
  {
    term: 'Cap Table',
    definition: 'Tabla de capitalización que muestra la estructura de propiedad de una empresa: quién posee qué porcentaje.',
    category: 'Estructura',
  },
  {
    term: 'Holding Company',
    definition: 'Sociedad matriz que posee las acciones de la empresa operativa adquirida, utilizada para estructurar la inversión.',
    category: 'Estructura',
  },
  {
    term: 'SPV (Special Purpose Vehicle)',
    definition: 'Sociedad creada específicamente para realizar una adquisición, aislando el riesgo de otras actividades.',
    example: 'Se crea una SPV para adquirir la empresa target, donde los inversores aportan equity y se estructura la deuda.',
    category: 'Estructura',
  },

  // === ROLES ===
  {
    term: 'Searcher',
    definition: 'El emprendedor que lidera el Search Fund. Busca la empresa, negocia la adquisición y luego la dirige como CEO.',
    category: 'Roles',
  },
  {
    term: 'Lead Investor',
    definition: 'Inversor principal que aporta un porcentaje significativo del capital y suele tener rol activo en la supervisión.',
    category: 'Roles',
  },
  {
    term: 'LP (Limited Partner)',
    definition: 'Inversor pasivo que aporta capital pero no participa en la gestión diaria del Search Fund.',
    category: 'Roles',
  },
  {
    term: 'Operating Partner',
    definition: 'Profesional experimentado que asesora al searcher durante la búsqueda y la operación post-adquisición.',
    category: 'Roles',
  },

  // === DOCUMENTOS ===
  {
    term: 'LOI (Letter of Intent)',
    definition: 'Carta de intenciones que establece los términos principales de una transacción antes de la due diligence formal.',
    example: 'El LOI incluye precio indicativo de 5M€, estructura de pago y exclusividad de 60 días.',
    category: 'Documentos',
  },
  {
    term: 'SPA (Share Purchase Agreement)',
    definition: 'Contrato de compraventa de acciones. Documento legal definitivo que formaliza la transacción.',
    category: 'Documentos',
  },
  {
    term: 'SHA (Shareholders Agreement)',
    definition: 'Pacto de socios que regula las relaciones entre accionistas: derechos, obligaciones, governance y salidas.',
    category: 'Documentos',
  },
  {
    term: 'NDA (Non-Disclosure Agreement)',
    definition: 'Acuerdo de confidencialidad que los compradores potenciales firman antes de recibir información sensible.',
    category: 'Documentos',
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
    term: 'Term Sheet',
    definition: 'Documento que resume los términos principales de la inversión o adquisición, previo a los contratos definitivos.',
    category: 'Documentos',
  },

  // === PROCESO ===
  {
    term: 'Due Diligence',
    definition: 'Proceso de investigación exhaustiva de una empresa antes de su adquisición: financiera, legal, fiscal, comercial y operativa.',
    category: 'Proceso',
  },
  {
    term: 'Exclusividad',
    definition: 'Período durante el cual el vendedor no puede negociar con otros compradores. Típicamente 60-90 días.',
    category: 'Proceso',
  },
  {
    term: 'Closing',
    definition: 'Momento en que se firma el SPA, se transfieren las acciones y se paga el precio acordado.',
    category: 'Proceso',
  },
  {
    term: 'Signing',
    definition: 'Firma de los contratos definitivos, que puede ocurrir antes del closing si hay condiciones pendientes.',
    category: 'Proceso',
  },
  {
    term: 'Closing Conditions',
    definition: 'Requisitos que deben cumplirse entre signing y closing: aprobaciones regulatorias, consentimientos, etc.',
    example: 'Condiciones típicas: aprobación de competencia, renuncia a derechos de tanteo, obtención de financiación.',
    category: 'Proceso',
  },

  // === FINANCIERO ===
  {
    term: 'EBITDA',
    definition: 'Earnings Before Interest, Taxes, Depreciation and Amortization. Métrica clave para valorar empresas en M&A.',
    example: 'Una empresa con 1M€ de EBITDA y múltiplo de 5x tendría una valoración de 5M€.',
    category: 'Financiero',
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
    term: 'Enterprise Value (EV)',
    definition: 'Valor de empresa: capitalización + deuda neta. Representa el valor total del negocio.',
    example: 'Una empresa con equity de 4M€ y deuda neta de 1M€ tiene un EV de 5M€.',
    category: 'Financiero',
  },
  {
    term: 'Working Capital',
    definition: 'Capital circulante: activo corriente menos pasivo corriente. Representa el capital necesario para operar.',
    category: 'Financiero',
  },
  {
    term: 'Working Capital Adjustment',
    definition: 'Ajuste del precio de compra basado en la diferencia entre el working capital real y el acordado al cierre.',
    example: 'Si el WC acordado era 500K€ y al cierre hay 450K€, el precio se reduce en 50K€.',
    category: 'Financiero',
  },
  {
    term: 'Net Debt',
    definition: 'Deuda neta: deuda financiera total menos caja y equivalentes. Usada para calcular el Enterprise Value.',
    category: 'Financiero',
  },
  {
    term: 'FCF (Free Cash Flow)',
    definition: 'Flujo de caja libre: efectivo generado por las operaciones menos inversiones en CAPEX.',
    category: 'Financiero',
  },
  {
    term: 'MOIC (Multiple on Invested Capital)',
    definition: 'Múltiplo sobre el capital invertido. Si inviertes 1M€ y recibes 3M€, el MOIC es 3.0x.',
    category: 'Financiero',
  },

  // === FINANCIACIÓN ===
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
    term: 'LBO (Leveraged Buyout)',
    definition: 'Adquisición apalancada donde gran parte del precio se financia con deuda, usando los activos y flujos de la empresa como garantía.',
    category: 'Financiación',
  },
  {
    term: 'MBO (Management Buyout)',
    definition: 'Adquisición de una empresa por su propio equipo directivo, típicamente con apoyo de inversores financieros.',
    category: 'Financiación',
  },
  {
    term: 'MBI (Management Buy-In)',
    definition: 'Adquisición de una empresa por un equipo directivo externo. El modelo Search Fund es esencialmente un MBI.',
    category: 'Financiación',
  },
  {
    term: 'Senior Debt',
    definition: 'Deuda con prioridad de cobro en caso de liquidación. Típicamente de bancos, con tipos más bajos.',
    category: 'Financiación',
  },
  {
    term: 'Mezzanine Debt',
    definition: 'Deuda subordinada a la senior, con mayor riesgo y tipo de interés. A veces incluye equity kickers.',
    category: 'Financiación',
  },
  {
    term: 'Unitranche',
    definition: 'Estructura de financiación que combina deuda senior y subordinada en un único tramo con un solo prestamista.',
    category: 'Financiación',
  },

  // === LEGAL ===
  {
    term: 'Reps & Warranties',
    definition: 'Declaraciones y garantías del vendedor sobre la situación de la empresa: estados financieros, contratos, litigios, etc.',
    example: 'El vendedor garantiza que no hay litigios pendientes ni contingencias fiscales no reveladas.',
    category: 'Legal',
  },
  {
    term: 'Indemnification',
    definition: 'Obligación del vendedor de compensar al comprador por pérdidas derivadas de incumplimiento de garantías.',
    category: 'Legal',
  },
  {
    term: 'Escrow',
    definition: 'Cuenta de garantía donde se deposita parte del precio para cubrir posibles reclamaciones post-cierre.',
    example: 'Se retiene 500K€ en escrow durante 18 meses para cubrir contingencias fiscales.',
    category: 'Legal',
  },
  {
    term: 'MAC Clause',
    definition: 'Material Adverse Change: cláusula que permite rescindir el contrato si ocurren cambios materialmente adversos antes del cierre.',
    category: 'Legal',
  },
  {
    term: 'Non-Compete',
    definition: 'Cláusula de no competencia: el vendedor se compromete a no competir con la empresa vendida durante un período.',
    example: 'No competencia de 3 años en un radio de 100km en el mismo sector de actividad.',
    category: 'Legal',
  },
  {
    term: 'Drag-Along',
    definition: 'Derecho que permite a los accionistas mayoritarios obligar a los minoritarios a vender en las mismas condiciones.',
    category: 'Legal',
  },
  {
    term: 'Tag-Along',
    definition: 'Derecho de los accionistas minoritarios a vender sus acciones en las mismas condiciones que los mayoritarios.',
    category: 'Legal',
  },
  {
    term: 'Anti-Dilution',
    definition: 'Protección para inversores que les permite mantener su porcentaje si hay ampliaciones de capital a menor valoración.',
    category: 'Legal',
  },
  {
    term: 'Share Deal vs Asset Deal',
    definition: 'Share deal: compra de acciones. Asset deal: compra de activos y pasivos seleccionados. Implicaciones fiscales diferentes.',
    category: 'Legal',
  },
  {
    term: 'Waterfall Distribution',
    definition: 'Orden de distribución de retornos entre los distintos tipos de inversores y el searcher.',
    example: 'Primero se devuelve el capital a inversores, luego preferred return del 8%, después carry al searcher.',
    category: 'Legal',
  },

  // === VALORACIÓN ===
  {
    term: 'Múltiplo EV/EBITDA',
    definition: 'Ratio de valoración que divide el Enterprise Value entre el EBITDA. En Search Funds típicamente 4-6x.',
    category: 'Valoración',
  },
  {
    term: 'DCF (Discounted Cash Flow)',
    definition: 'Método de valoración que descuenta los flujos de caja futuros a valor presente usando una tasa de descuento.',
    category: 'Valoración',
  },
  {
    term: 'Comparable Transactions',
    definition: 'Método de valoración basado en múltiplos de transacciones similares en el mismo sector.',
    category: 'Valoración',
  },
  {
    term: 'Quality of Earnings (QoE)',
    definition: 'Análisis detallado de la calidad y sostenibilidad de los beneficios reportados por la empresa.',
    example: 'El QoE reveló que 200K€ del EBITDA eran ingresos extraordinarios no recurrentes.',
    category: 'Valoración',
  },
  {
    term: 'Normalización de EBITDA',
    definition: 'Ajuste del EBITDA para reflejar el rendimiento operativo real, eliminando gastos no recurrentes o extraordinarios.',
    example: 'Se añaden 150K€ al EBITDA: 100K€ de salario no mercado del fundador + 50K€ de gastos extraordinarios.',
    category: 'Valoración',
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
  const totalTerms = glossaryTerms.length;

  return (
    <UnifiedLayout>
      <SEOHead
        title={`Glosario M&A y Search Funds | ${totalTerms} Términos | Capittal`}
        description={`Diccionario completo de ${totalTerms} términos M&A y Search Funds: LOI, EBITDA, Due Diligence, Earn-out, LBO, MBO y más. Definiciones claras con ejemplos prácticos.`}
        canonical="https://capittal.es/search-funds/recursos/glosario"
        structuredData={getWebPageSchema('Glosario M&A y Search Funds', `Diccionario completo de ${totalTerms} términos M&A y Search Funds con definiciones claras y ejemplos prácticos.`, 'https://capittal.es/search-funds/recursos/glosario')}
      />

      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Glosario M&A y Search Funds</h1>
            <p className="text-muted-foreground text-center mb-2 max-w-2xl mx-auto">
              Términos clave del mundo de las fusiones y adquisiciones explicados de forma clara y con ejemplos prácticos.
            </p>
            <p className="text-sm text-primary font-medium text-center mb-8">
              {totalTerms} términos en {categories.length} categorías
            </p>

            <GlossarySearch onSearch={setSearchTerm} />

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {categories.map((cat) => {
                const count = glossaryTerms.filter((t) => t.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSearchTerm(cat)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      searchTerm === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-1 text-sm rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  Limpiar filtro
                </button>
              )}
            </div>

            <div className="text-sm text-muted-foreground mb-4">
              Mostrando {filteredTerms.length} de {totalTerms} términos
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
