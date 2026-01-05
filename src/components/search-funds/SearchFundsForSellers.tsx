import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Heart, Clock, TrendingUp, Users } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

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
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Para empresarios
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
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
              <div 
                key={index} 
                className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-primary" />
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
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <InteractiveHoverButton 
                  text="Valorar mi empresa gratis →"
                  onClick={() => navigate('/lp/calculadora?origen=search-funds')}
                />
              </div>
            </div>

            {/* Myths vs Reality */}
            <div className="bg-muted/30 border border-border rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                Mitos vs Realidad
              </h3>
              <div className="space-y-6">
                {myths.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground line-through">{item.myth}</span>
                    </div>
                    <div className="flex items-start gap-2 pl-7">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
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

export default SearchFundsForSellers;
