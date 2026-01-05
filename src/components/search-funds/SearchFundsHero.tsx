import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SearchFundsHero = () => {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-8">
            <Shield className="w-4 h-4" />
            <span>Servicio especializado en M&A</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Search Funds: 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Emprendedores que harán crecer tu empresa
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto">
            Conectamos empresarios españoles con Search Funds profesionales y verificados. 
            Aportamos el rigor y la seriedad que este modelo de inversión necesita en España.
          </p>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">#1</div>
              <div className="text-sm text-white/60">España en Europa</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">67+</div>
              <div className="text-sm text-white/60">Search Funds creados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">32%</div>
              <div className="text-sm text-white/60">IRR histórico medio</div>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90 text-lg px-8">
              <Link to="/contacto?origen=search-funds-vendedor">
                Soy empresario y quiero vender
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 text-lg px-8">
              <Link to="/contacto?origen=search-funds-searcher">
                Soy Searcher y busco deal flow
              </Link>
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>+500 empresas valoradas</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Operaciones desde €1M a €20M</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>100% confidencial</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
