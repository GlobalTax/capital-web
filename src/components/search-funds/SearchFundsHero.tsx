import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, TrendingUp, Users, Building2 } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const SearchFundsHero: React.FC = () => {
  const navigate = useNavigate();
  
  const benefits = [
    "Emprendedores de élite que invierten su futuro en tu empresa",
    "Proceso de due diligence riguroso y profesional",
    "Horizonte de 5-7 años con implicación operativa total"
  ];

  const stats = [
    { value: "#1", label: "España líder en Europa", icon: TrendingUp },
    { value: "67+", label: "Search Funds creados", icon: Building2 },
    { value: "32%", label: "Rentabilidad histórica", icon: TrendingUp },
  ];

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-background py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              Servicio especializado en M&A
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Search Funds: <br />
                <span className="text-primary">El futuro de la sucesión empresarial</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Conectamos tu empresa con emprendedores de primer nivel que buscan 
                liderar y hacer crecer negocios consolidados.
              </p>
            </div>

            {/* Benefits */}
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <InteractiveHoverButton 
                text="Quiero vender"
                onClick={scrollToContact}
                size="lg"
              />
              <InteractiveHoverButton 
                text="Busco dealflow"
                onClick={() => navigate('/contacto?origen=search-funds-searcher')}
                variant="secondary"
                size="lg"
              />
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>+200 empresas valoradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Confidencialidad 100%</span>
              </div>
            </div>
          </div>

          {/* Right Column - Stats Card */}
          <div className="relative">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
              <div className="space-y-6">
                <div className="text-center pb-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Search Funds en España
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    El mercado más activo de Europa
                  </p>
                </div>

                <div className="grid gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>Respaldado por</span>
                    <span className="font-semibold text-foreground">IESE • IE • ESADE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchFundsHero;
