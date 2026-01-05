import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { LibraryItem } from '@/components/search-funds-center';

const libraryItems = [
  {
    title: 'Search Fund Primer',
    description: 'La guía definitiva de Stanford GSB sobre el modelo de Search Funds. Lectura esencial.',
    type: 'pdf' as const,
    source: 'Stanford GSB',
    url: 'https://www.gsb.stanford.edu/faculty-research/centers-initiatives/ces/research/search-funds',
  },
  {
    title: 'IESE Search Fund Study 2023',
    description: 'Estudio anual con datos actualizados sobre rendimiento y tendencias de Search Funds.',
    type: 'pdf' as const,
    source: 'IESE Business School',
    url: 'https://www.iese.edu/faculty-research/search-fund/',
  },
  {
    title: 'How Search Funds Work',
    description: 'Explicación visual del modelo Search Fund en menos de 10 minutos.',
    type: 'video' as const,
    source: 'YouTube',
    url: 'https://www.youtube.com/results?search_query=search+funds+explained',
  },
  {
    title: 'Search Fund Podcast',
    description: 'Entrevistas con searchers exitosos y sus experiencias de adquisición.',
    type: 'podcast' as const,
    source: 'Think Like an Owner',
    url: 'https://www.thinklikeanowner.com/',
  },
  {
    title: 'IE Search Fund Guide',
    description: 'Guía práctica del programa de Search Funds de IE Business School.',
    type: 'pdf' as const,
    source: 'IE Business School',
    url: 'https://www.ie.edu/',
  },
  {
    title: 'Acquiring Minds Podcast',
    description: 'Historias de emprendedores que han comprado empresas pequeñas.',
    type: 'podcast' as const,
    source: 'Acquiring Minds',
    url: 'https://acquiringminds.co/',
  },
  {
    title: 'The Complete Guide to Search Funds',
    description: 'Artículo detallado sobre el proceso completo de un Search Fund.',
    type: 'article' as const,
    source: 'Harvard Business Review',
    url: 'https://hbr.org/',
  },
  {
    title: 'Search Fund Economics',
    description: 'Análisis profundo de los retornos y estructura económica de los Search Funds.',
    type: 'pdf' as const,
    source: 'Stanford GSB',
    url: 'https://www.gsb.stanford.edu/',
  },
];

const SearchFundsLibrary = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pdfs = libraryItems.filter((item) => item.type === 'pdf');
  const videos = libraryItems.filter((item) => item.type === 'video');
  const podcasts = libraryItems.filter((item) => item.type === 'podcast');
  const articles = libraryItems.filter((item) => item.type === 'article');

  return (
    <UnifiedLayout>
      <Helmet>
        <title>Biblioteca Search Funds | Estudios, PDFs y Recursos | Capittal</title>
        <meta 
          name="description" 
          content="Biblioteca de recursos sobre Search Funds: estudios de Stanford, IESE, podcasts, videos y artículos. Todo el conocimiento en un solo lugar." 
        />
        <link rel="canonical" href="https://capittal.es/search-funds/recursos/biblioteca" />
      </Helmet>

      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Biblioteca</h1>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Estudios, whitepapers, podcasts y videos sobre Search Funds de las mejores fuentes.
            </p>

            <div className="space-y-12">
              {pdfs.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">Estudios y PDFs</h2>
                  <div className="grid gap-4">
                    {pdfs.map((item) => (
                      <LibraryItem key={item.title} {...item} />
                    ))}
                  </div>
                </section>
              )}

              {podcasts.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">Podcasts</h2>
                  <div className="grid gap-4">
                    {podcasts.map((item) => (
                      <LibraryItem key={item.title} {...item} />
                    ))}
                  </div>
                </section>
              )}

              {videos.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">Videos</h2>
                  <div className="grid gap-4">
                    {videos.map((item) => (
                      <LibraryItem key={item.title} {...item} />
                    ))}
                  </div>
                </section>
              )}

              {articles.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">Artículos</h2>
                  <div className="grid gap-4">
                    {articles.map((item) => (
                      <LibraryItem key={item.title} {...item} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsLibrary;
