import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/seo/SEOHead';

export default function SearcherRegistrationConfirmation() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Registro Completado | Capittal"
        description="Tu registro como Searcher se ha completado correctamente."
        noindex={true}
      />
      <Header />

      <section className="py-20 md:py-32 bg-background flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            ¡Registro completado!
          </h1>

          <p className="text-lg text-slate-600 mb-8">
            Hemos recibido tu perfil correctamente. Nuestro equipo lo revisará y te contactará 
            en las próximas 48-72 horas para validar tu información.
          </p>

          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="font-semibold text-foreground mb-4">¿Qué sucede ahora?</h2>
            <ul className="text-left space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">1</span>
                <span>Revisaremos tu perfil y criterios de búsqueda</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">2</span>
                <span>Te contactaremos para una breve llamada de validación</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">3</span>
                <span>Una vez verificado, empezarás a recibir operaciones que encajen con tu perfil</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild>
              <Link to="/search-funds">
                Conocer más sobre Search Funds
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                Volver al inicio
              </Link>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">¿Tienes alguna pregunta?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:info@capittal.es" className="inline-flex items-center gap-2 hover:text-primary">
                <Mail className="w-4 h-4" />
                info@capittal.es
              </a>
              <a href="tel:+34910052656" className="inline-flex items-center gap-2 hover:text-primary">
                <Phone className="w-4 h-4" />
                +34 910 052 656
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
