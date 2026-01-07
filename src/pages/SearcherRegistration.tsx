import { useEffect } from 'react';
import { Search, Shield, Target, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { SearcherRegistrationForm } from '@/components/search-funds/registration/SearcherRegistrationForm';

const FEATURES = [
  {
    icon: Target,
    title: 'Matching personalizado',
    description: 'Recibe operaciones que encajan con tu perfil de inversión'
  },
  {
    icon: Shield,
    title: 'Confidencialidad total',
    description: 'Tu información está protegida y solo se comparte con tu consentimiento'
  },
  {
    icon: Users,
    title: 'Red exclusiva',
    description: 'Accede a operaciones de nuestro marketplace privado'
  }
];

export default function SearcherRegistration() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Registro de Searchers | Capittal"
        description="Regístrate como Searcher y recibe operaciones que encajan con tu perfil de inversión. Accede a oportunidades exclusivas de adquisición de empresas en España."
        canonical="https://capittal.es/search-funds/registro-searcher"
        noindex={true}
      />
      <Header />

      {/* Hero */}
      <section className="py-20 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Search className="w-4 h-4" />
              <span>Registro de Searchers</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Encuentra tu empresa ideal
            </h1>
            <p className="text-lg md:text-xl text-slate-600">
              Completa tu perfil y recibe operaciones que encajan con tus criterios de búsqueda. 
              Te conectamos con empresarios que buscan un sucesor.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl border border-border p-6 text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 md:py-20 bg-muted/30 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearcherRegistrationForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
