import { ArrowRight, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const SearchFundsCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-blue-600">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para explorar el modelo Search Fund?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Ya seas empresario buscando el comprador ideal o Searcher buscando tu próxima empresa, 
            Capittal es tu partner de confianza.
          </p>

          {/* Dual CTAs */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            {/* For Sellers */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Para empresarios</h3>
              <p className="text-sm text-white/70 mb-4">
                Descubre si tu empresa encaja con el perfil de Search Funds y obtén una valoración gratuita.
              </p>
              <Button asChild size="lg" className="w-full bg-white text-primary hover:bg-white/90">
                <Link to="/lp/calculadora?origen=search-funds">
                  Valorar mi empresa gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* For Searchers */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Para Searchers</h3>
              <p className="text-sm text-white/70 mb-4">
                Únete a nuestra red y accede a deal flow cualificado de empresas españolas.
              </p>
              <Button asChild variant="outline" size="lg" className="w-full border-white text-white hover:bg-white/10">
                <Link to="/contacto?origen=search-funds-searcher">
                  Registrarme como Searcher
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Contact Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-white/70">
            <a href="tel:+34935555555" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              <span>+34 935 555 555</span>
            </a>
            <span className="hidden sm:inline">•</span>
            <Link to="/contacto" className="flex items-center gap-2 hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Reservar una consulta gratuita</span>
            </Link>
          </div>

          {/* Trust Note */}
          <p className="mt-8 text-sm text-white/50">
            100% confidencial • Sin compromiso • Respuesta en 24h
          </p>
        </div>
      </div>
    </section>
  );
};
