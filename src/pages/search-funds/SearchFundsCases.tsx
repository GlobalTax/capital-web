import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Building2, TrendingUp, Users, Calendar, MapPin } from 'lucide-react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { ResourceCenterNav } from '@/components/search-funds-center';

const cases = [
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
    highlights: [
      'Fundador de 62 años sin sucesión familiar',
      'Searcher con experiencia en el sector',
      'Vendor financing del 20%',
      'Crecimiento del 25% en el primer año post-adquisición',
    ],
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
    highlights: [
      'Empresa con 20 años de trayectoria',
      'Base de clientes diversificada',
      'Searcher MBA de IE Business School',
      'Estructura mixta: equity + deuda bancaria',
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
    highlights: [
      'Nicho de mercado con barreras de entrada',
      'Contratos recurrentes con hospitales',
      'Equity rollover del vendedor (15%)',
      'Expansión a Portugal en el año 2',
    ],
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
    highlights: [
      'SaaS con ingresos recurrentes (85%)',
      'Fundadores técnicos permanecen como asesores',
      'Self-funded search',
      'Multiple de entrada: 4.5x EBITDA',
    ],
  },
];

const SearchFundsCases = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout>
      <Helmet>
        <title>Casos de Éxito Search Funds España | Capittal</title>
        <meta 
          name="description" 
          content="Historias reales de transacciones Search Funds en España. Casos de éxito en sectores industrial, servicios, healthcare y tecnología." 
        />
        <link rel="canonical" href="https://capittal.es/search-funds/recursos/casos" />
      </Helmet>

      <div className="pt-24">
        <ResourceCenterNav />
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Casos de Éxito</h1>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Ejemplos reales de transacciones Search Funds en España. Por confidencialidad, 
              los nombres de las empresas no se revelan.
            </p>

            <div className="grid gap-8">
              {cases.map((caseStudy) => (
                <div
                  key={caseStudy.id}
                  className="p-6 md:p-8 rounded-2xl border bg-card"
                >
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
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-500/10 text-green-600">
                      Cerrada
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                  </div>

                  <div>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsCases;
