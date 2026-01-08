import { useNavigate } from 'react-router-dom';
import { Target, Shield, Zap, Handshake, CheckCircle } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const benefits = [
  {
    icon: Target,
    title: "Deal flow cualificado",
    description: "Acceso a empresas pre-filtradas que cumplen criterios de Search Fund: €1M-€5M EBITDA, sectores estables, propietarios motivados."
  },
  {
    icon: Shield,
    title: "Credibilidad ante vendedores",
    description: "Nuestra reputación te abre puertas. Los empresarios confían en Capittal y eso se transfiere a ti."
  },
  {
    icon: Zap,
    title: "Proceso acelerado",
    description: "Empresas ya valoradas, con información financiera estructurada y propietarios educados sobre el modelo Search Fund."
  },
  {
    icon: Handshake,
    title: "Soporte en negociación",
    description: "Te acompañamos en la negociación, estructuración del deal y due diligence para maximizar tus probabilidades de éxito."
  }
];

const requirements = [
  "Searcher en fase de búsqueda activa o con capital comprometido",
  "Respaldo de inversores institucionales o family offices reconocidos",
  "Formación y experiencia profesional verificable",
  "Criterios de búsqueda claros y alineados con nuestro deal flow",
  "Compromiso de profesionalidad en el trato con empresarios"
];

export const SearchFundsForSearchers = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Para Searchers
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-6">
              ¿Eres Searcher y buscas deal flow en España?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Capittal es tu puerta de entrada a empresas españolas de calidad. 
              Te conectamos con propietarios que entienden el modelo Search Fund y están listos para negociar.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Requirements */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                Lo que buscamos en un Searcher
              </h3>
              <div className="space-y-4">
                {requirements.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-normal text-foreground mb-4">
                Únete a nuestra red de Searchers
              </h3>
              <p className="text-muted-foreground mb-6">
                Completa nuestro formulario de registro y te contactaremos para verificar tu perfil 
                y darte acceso a nuestro deal flow cualificado.
              </p>
              <InteractiveHoverButton 
                text="Registrarme como Searcher →"
                onClick={() => navigate('/search-funds/registro-searcher')}
              />
              <p className="text-xs text-muted-foreground mt-4">
                Proceso de verificación en 48-72h. Sin coste hasta encontrar empresa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchFundsForSearchers;
