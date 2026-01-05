import { CheckCircle, XCircle, ArrowRight, Heart, Clock, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const benefits = [
  {
    icon: Heart,
    title: "Continuidad del legado",
    description: "El Searcher se convierte en CEO y se compromete personalmente con el éxito de tu empresa durante 5-7 años."
  },
  {
    icon: Clock,
    title: "Transición gradual",
    description: "Posibilidad de permanecer como advisor o mantener una participación minoritaria durante la transición."
  },
  {
    icon: TrendingUp,
    title: "Crecimiento garantizado",
    description: "Los Searchers están motivados para hacer crecer la empresa, no para recortar costes y vender rápido."
  },
  {
    icon: Users,
    title: "Trato personal",
    description: "Negociación directa con el futuro propietario, no con un fondo o comité de inversión impersonal."
  }
];

const idealProfile = [
  "Facturación entre €2M y €15M",
  "EBITDA entre €500K y €3M",
  "Negocio estable con flujos de caja predecibles",
  "Propietario que busca retirarse o reducir implicación",
  "Sector no cíclico (servicios, tecnología, salud, industria)",
  "Equipo operativo que puede funcionar sin el fundador"
];

const myths = [
  {
    myth: "Los Search Funds son inversores inexpertos",
    reality: "Los Searchers suelen tener MBA de escuelas top y experiencia previa en consultoría, banca o industria."
  },
  {
    myth: "No tienen dinero para comprar",
    reality: "Están respaldados por inversores institucionales y family offices con capital comprometido."
  },
  {
    myth: "Solo quieren empresas baratas",
    reality: "Buscan empresas de calidad y pagan múltiplos de mercado (4-7x EBITDA típicamente)."
  }
];

export const SearchFundsForSellers = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Para empresarios
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
              ¿Por qué vender a un Search Fund?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Si buscas un comprador que cuide tu legado, mantenga a tu equipo y haga crecer 
              tu empresa a largo plazo, un Search Fund puede ser la opción ideal.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Ideal Profile */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                Perfil ideal para Search Funds
              </h3>
              <div className="space-y-3">
                {idealProfile.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-8 w-full" size="lg">
                <Link to="/lp/calculadora?origen=search-funds">
                  Valorar mi empresa gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Myths vs Reality */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                Mitos vs Realidad
              </h3>
              <div className="space-y-6">
                {myths.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground line-through">{item.myth}</span>
                    </div>
                    <div className="flex items-start gap-2 pl-7">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium">{item.reality}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
