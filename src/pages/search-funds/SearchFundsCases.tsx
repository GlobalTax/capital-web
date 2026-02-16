import { useEffect, useState } from 'react';
import { Building2, TrendingUp, Users, Calendar, MapPin, Filter, Lightbulb, Quote, Award } from 'lucide-react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo/schemas';

interface CaseStudy {
  id: number;
  sector: string;
  subsector: string;
  location: string;
  revenue: string;
  ebitda: string;
  employees: string;
  year: number;
  duration: string;
  multiple?: string;
  highlights: string[];
  lessons?: string[];
  testimonial?: {
    quote: string;
    role: string;
  };
  isCapittal?: boolean;
  dealType?: 'traditional' | 'self-funded' | 'accelerator';
}

const cases: CaseStudy[] = [
  {
    id: 1,
    sector: 'Industrial',
    subsector: 'Fabricación de componentes',
    location: 'País Vasco',
    revenue: '8M€',
    ebitda: '1.2M€',
    employees: '45',
    year: 2023,
    duration: '14 meses',
    multiple: '5.2x',
    dealType: 'traditional',
    highlights: [
      'Fundador de 62 años sin sucesión familiar',
      'Searcher con experiencia en el sector',
      'Vendor financing del 20%',
      'Crecimiento del 25% en el primer año post-adquisición',
    ],
    lessons: [
      'La experiencia sectorial del searcher aceleró la integración',
      'El vendor financing alineó intereses durante la transición',
      'Mantener al equipo directivo fue clave para la continuidad',
    ],
    testimonial: {
      quote: 'El searcher entendió desde el primer día nuestra cultura industrial. La transición fue más suave de lo que esperaba.',
      role: 'Fundador y vendedor',
    },
    isCapittal: true,
  },
  {
    id: 2,
    sector: 'Servicios B2B',
    subsector: 'Consultoría técnica',
    location: 'Madrid',
    revenue: '4.5M€',
    ebitda: '750K€',
    employees: '28',
    year: 2023,
    duration: '11 meses',
    multiple: '5.5x',
    dealType: 'traditional',
    highlights: [
      'Empresa con 20 años de trayectoria',
      'Base de clientes diversificada',
      'Searcher MBA de IE Business School',
      'Estructura mixta: equity + deuda bancaria',
    ],
    lessons: [
      'La diversificación de clientes redujo el riesgo percibido',
      'Los procesos documentados facilitaron la due diligence',
      'La reputación de la escuela de negocios ayudó con inversores',
    ],
  },
  {
    id: 3,
    sector: 'Healthcare',
    subsector: 'Equipamiento médico',
    location: 'Cataluña',
    revenue: '6M€',
    ebitda: '900K€',
    employees: '35',
    year: 2022,
    duration: '16 meses',
    multiple: '6.0x',
    dealType: 'traditional',
    highlights: [
      'Nicho de mercado con barreras de entrada',
      'Contratos recurrentes con hospitales',
      'Equity rollover del vendedor (15%)',
      'Expansión a Portugal en el año 2',
    ],
    lessons: [
      'Los ingresos recurrentes justificaron un múltiplo más alto',
      'El rollover del vendedor facilitó la transición de conocimiento',
      'El nicho especializado atrajo inversores sectoriales',
    ],
    testimonial: {
      quote: 'Mantener un 15% me permitió seguir vinculado al proyecto que creé hace 25 años.',
      role: 'Fundador (mantuvo 15%)',
    },
  },
  {
    id: 4,
    sector: 'Tecnología',
    subsector: 'Software vertical',
    location: 'Valencia',
    revenue: '3M€',
    ebitda: '600K€',
    employees: '18',
    year: 2024,
    duration: '9 meses',
    multiple: '4.5x',
    dealType: 'self-funded',
    highlights: [
      'SaaS con ingresos recurrentes (85%)',
      'Fundadores técnicos permanecen como asesores',
      'Self-funded search',
      'Multiple de entrada: 4.5x EBITDA',
    ],
    lessons: [
      'El modelo SaaS con MRR alto atrajo financiación bancaria',
      'Self-funded permitió mayor flexibilidad en la negociación',
      'La retención de talento técnico fue prioritaria',
    ],
    isCapittal: true,
  },
  {
    id: 5,
    sector: 'Distribución',
    subsector: 'Distribución alimentaria B2B',
    location: 'Andalucía',
    revenue: '12M€',
    ebitda: '1.5M€',
    employees: '52',
    year: 2023,
    duration: '18 meses',
    multiple: '4.8x',
    dealType: 'traditional',
    highlights: [
      'Segunda generación sin interés en continuar',
      'Flota logística propia (12 vehículos)',
      'Cartera de +300 clientes activos',
      'Margen EBITDA del 12.5%',
    ],
    lessons: [
      'Las empresas familiares requieren sensibilidad en la negociación',
      'Los activos logísticos añadieron valor tangible',
      'La relación con clientes históricos se mantuvo gracias al equipo',
    ],
    testimonial: {
      quote: 'Mi padre fundó esta empresa hace 40 años. Encontrar a alguien que la valorara como nosotros fue lo más importante.',
      role: 'Segunda generación - Vendedor',
    },
  },
  {
    id: 6,
    sector: 'Servicios',
    subsector: 'Mantenimiento industrial',
    location: 'Galicia',
    revenue: '5.5M€',
    ebitda: '820K€',
    employees: '42',
    year: 2024,
    duration: '12 meses',
    multiple: '5.0x',
    dealType: 'accelerator',
    highlights: [
      'Contratos de mantenimiento plurianuales',
      'Certificaciones técnicas especializadas',
      'Searcher vía programa acelerador',
      'SBA-style financing (deuda respaldada)',
    ],
    lessons: [
      'Los contratos recurrentes dieron visibilidad a los flujos de caja',
      'Las certificaciones son barreras de entrada difíciles de replicar',
      'El programa acelerador proporcionó soporte durante la integración',
    ],
  },
  {
    id: 7,
    sector: 'Manufactura',
    subsector: 'Plásticos técnicos',
    location: 'Aragón',
    revenue: '7M€',
    ebitda: '1.1M€',
    employees: '38',
    year: 2022,
    duration: '15 meses',
    multiple: '5.3x',
    dealType: 'traditional',
    highlights: [
      'Especialización en sector automoción',
      'Maquinaria de última generación',
      'Fundador como consultor 2 años post-venta',
      'Mejora de márgenes del 15% en año 1',
    ],
    lessons: [
      'La consultoría del fundador evitó pérdida de know-how técnico',
      'La inversión previa en maquinaria redujo CAPEX inicial',
      'La dependencia de automoción se diversificó post-adquisición',
    ],
    testimonial: {
      quote: 'Después de 30 años, quería asegurarme de que la empresa seguiría creciendo. El searcher demostró un plan sólido.',
      role: 'Fundador (consultor 2 años)',
    },
    isCapittal: true,
  },
  {
    id: 8,
    sector: 'Servicios B2B',
    subsector: 'Formación corporativa',
    location: 'Madrid',
    revenue: '2.8M€',
    ebitda: '480K€',
    employees: '15',
    year: 2024,
    duration: '8 meses',
    multiple: '4.2x',
    dealType: 'self-funded',
    highlights: [
      'Red de formadores externos (escalabilidad)',
      'Clientes Fortune 500 en cartera',
      'Modelo asset-light',
      'Transición rápida: fundador salió en 6 meses',
    ],
    lessons: [
      'El modelo asset-light permite valoraciones atractivas',
      'La velocidad de transición depende de la documentación previa',
      'Los clientes grandes aportan credibilidad pero concentran riesgo',
    ],
  },
];

const sectors = [...new Set(cases.map((c) => c.sector))];
const years = [...new Set(cases.map((c) => c.year))].sort((a, b) => b - a);
const dealTypes = [
  { value: 'traditional', label: 'Traditional Search' },
  { value: 'self-funded', label: 'Self-Funded' },
  { value: 'accelerator', label: 'Acelerador' },
];

const SearchFundsCases = () => {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredCases = cases.filter((c) => {
    if (selectedSector && c.sector !== selectedSector) return false;
    if (selectedYear && c.year !== selectedYear) return false;
    if (selectedType && c.dealType !== selectedType) return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedSector(null);
    setSelectedYear(null);
    setSelectedType(null);
  };

  const hasFilters = selectedSector || selectedYear || selectedType;

  return (
    <UnifiedLayout>
      <SEOHead
        title="Casos de Éxito Search Funds España | Capittal"
        description="Historias reales de transacciones Search Funds en España. Casos de éxito en sectores industrial, servicios, healthcare y tecnología con lecciones aprendidas."
        canonical="https://capittal.es/search-funds/recursos/casos"
        structuredData={getWebPageSchema('Casos de Éxito Search Funds España', 'Historias reales de transacciones Search Funds en España con lecciones aprendidas.', 'https://capittal.es/search-funds/recursos/casos')}
      />

      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Casos de Éxito</h1>
            <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
              Ejemplos reales de transacciones Search Funds en España. Por confidencialidad, 
              los nombres de las empresas no se revelan.
            </p>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-primary/5 text-center">
                <p className="text-2xl font-bold text-primary">{cases.length}</p>
                <p className="text-sm text-muted-foreground">Casos documentados</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 text-center">
                <p className="text-2xl font-bold text-primary">5.1x</p>
                <p className="text-sm text-muted-foreground">Múltiplo medio</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 text-center">
                <p className="text-2xl font-bold text-primary">12.6</p>
                <p className="text-sm text-muted-foreground">Meses promedio</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 text-center">
                <p className="text-2xl font-bold text-primary">{sectors.length}</p>
                <p className="text-sm text-muted-foreground">Sectores</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4" />
                Filtrar:
              </div>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector) => (
                  <Button
                    key={sector}
                    variant={selectedSector === sector ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSector(selectedSector === sector ? null : sector)}
                  >
                    {sector}
                  </Button>
                ))}
              </div>
              <div className="w-px h-6 bg-border hidden md:block" />
              <div className="flex flex-wrap gap-2">
                {years.map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
              <div className="w-px h-6 bg-border hidden md:block" />
              <div className="flex flex-wrap gap-2">
                {dealTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(selectedType === type.value ? null : type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                  Limpiar
                </Button>
              )}
            </div>

            {/* Cases Grid */}
            <div className="grid gap-8">
              {filteredCases.map((caseStudy) => (
                <div
                  key={caseStudy.id}
                  className="p-6 md:p-8 rounded-2xl border bg-card relative"
                >
                  {caseStudy.isCapittal && (
                    <div className="absolute -top-3 left-6">
                      <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Caso Capittal
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Building2 className="h-4 w-4" />
                        <span>{caseStudy.sector}</span>
                        <span>•</span>
                        <span>{caseStudy.subsector}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {caseStudy.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {caseStudy.year}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {caseStudy.dealType && (
                        <Badge variant="outline" className="capitalize">
                          {dealTypes.find((t) => t.value === caseStudy.dealType)?.label}
                        </Badge>
                      )}
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-500/10 text-green-600">
                        Cerrada
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Facturación</p>
                      <p className="text-xl font-semibold">{caseStudy.revenue}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">EBITDA</p>
                      <p className="text-xl font-semibold">{caseStudy.ebitda}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Empleados</p>
                      <p className="text-xl font-semibold flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {caseStudy.employees}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Duración</p>
                      <p className="text-xl font-semibold">{caseStudy.duration}</p>
                    </div>
                    {caseStudy.multiple && (
                      <div className="p-4 rounded-lg bg-primary/10">
                        <p className="text-sm text-muted-foreground mb-1">Múltiplo</p>
                        <p className="text-xl font-semibold text-primary">{caseStudy.multiple}</p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Aspectos destacados
                    </h4>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {caseStudy.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {caseStudy.lessons && caseStudy.lessons.length > 0 && (
                    <div className="mb-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-amber-700">
                        <Lightbulb className="h-4 w-4" />
                        Lecciones aprendidas
                      </h4>
                      <ul className="space-y-2">
                        {caseStudy.lessons.map((lesson, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-amber-600 mt-1">{idx + 1}.</span>
                            {lesson}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {caseStudy.testimonial && (
                    <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                      <div className="flex items-start gap-3">
                        <Quote className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-sm italic text-foreground mb-2">
                            "{caseStudy.testimonial.quote}"
                          </p>
                          <p className="text-xs text-muted-foreground">
                            — {caseStudy.testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredCases.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No se encontraron casos con los filtros seleccionados.</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsCases;
