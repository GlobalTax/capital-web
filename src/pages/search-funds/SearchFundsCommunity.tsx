import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, GraduationCap, Users, Calendar, Linkedin } from 'lucide-react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo/schemas';

const institutions = [
  {
    name: 'IESE Business School',
    description: 'Pioneros en Search Funds en Europa. Organizan el International Search Fund Study anualmente.',
    logo: '🎓',
    url: 'https://www.iese.edu/',
  },
  {
    name: 'IE Business School',
    description: 'Programa activo de Search Funds con mentores y red de inversores.',
    logo: '🎓',
    url: 'https://www.ie.edu/',
  },
  {
    name: 'ESADE',
    description: 'Centro de emprendimiento con recursos para adquisición de empresas.',
    logo: '🎓',
    url: 'https://www.esade.edu/',
  },
];

const communities = [
  {
    name: 'AcEF - Asociación de Emprendedores de España',
    description: 'Red de searchers y inversores en España.',
    type: 'Asociación',
    url: 'https://www.acef.es/',
  },
  {
    name: 'Search Fund Community LinkedIn',
    description: 'Grupo de LinkedIn con +5,000 miembros del ecosistema global.',
    type: 'LinkedIn',
    url: 'https://www.linkedin.com/groups/',
  },
  {
    name: 'European Search Fund Association',
    description: 'Asociación europea con eventos y recursos para searchers.',
    type: 'Asociación',
    url: '#',
  },
];

const events = [
  {
    name: 'IESE Search Fund Conference',
    description: 'Evento anual que reúne a searchers, inversores y vendedores.',
    date: 'Anual - Primavera',
    location: 'Barcelona',
  },
  {
    name: 'Search Fund Summit Europe',
    description: 'Cumbre europea con casos de estudio y networking.',
    date: 'Anual - Otoño',
    location: 'Madrid / Londres',
  },
];

const SearchFundsCommunity = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout>
      <SEOHead
        title="Comunidad Search Funds España | Networking y Eventos | Capittal"
        description="Conecta con el ecosistema de Search Funds en España: IESE, IE, ESADE, asociaciones, grupos de LinkedIn y eventos del sector."
        canonical="https://capittal.es/search-funds/recursos/comunidad"
        structuredData={getWebPageSchema('Comunidad Search Funds España', 'Conecta con el ecosistema de Search Funds en España: IESE, IE, ESADE y eventos del sector.', 'https://capittal.es/search-funds/recursos/comunidad')}
      />

      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Comunidad</h1>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Conecta con el ecosistema de Search Funds en España y Europa.
            </p>

            {/* Business Schools */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Escuelas de Negocio
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {institutions.map((inst) => (
                  <a
                    key={inst.name}
                    href={inst.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow group"
                  >
                    <div className="text-4xl mb-4">{inst.logo}</div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {inst.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{inst.description}</p>
                  </a>
                ))}
              </div>
            </section>

            {/* Communities */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Comunidades y Asociaciones
              </h2>
              <div className="grid gap-4">
                {communities.map((community) => (
                  <div
                    key={community.name}
                    className="flex items-center justify-between p-5 rounded-xl border bg-card"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{community.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                          {community.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{community.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={community.url} target="_blank" rel="noopener noreferrer">
                        {community.type === 'LinkedIn' ? (
                          <Linkedin className="h-4 w-4" />
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Events */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Eventos
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <div
                    key={event.name}
                    className="p-6 rounded-xl border bg-card"
                  >
                    <h3 className="font-semibold mb-2">{event.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{event.date}</span>
                      <span>•</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border">
              <h2 className="text-2xl font-semibold mb-4">¿Quieres conectar con nosotros?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Capittal es parte activa del ecosistema de Search Funds en España. 
                Contáctanos para explorar oportunidades.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/servicios/search-funds">Conocer nuestro servicio</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contacto">Contactar</Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsCommunity;
