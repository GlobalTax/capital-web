import { Target, Shield, Zap, Handshake, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-blue-400 font-medium text-sm uppercase tracking-wider">
              Para Searchers
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-6">
              ¿Eres Searcher y buscas deal flow en España?
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Capittal es tu puerta de entrada a empresas españolas de calidad. 
              Te conectamos con propietarios que entienden el modelo Search Fund y están listos para negociar.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-sm text-white/60">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Requirements */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">
                Lo que buscamos en un Searcher
              </h3>
              <div className="space-y-4">
                {requirements.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Únete a nuestra red de Searchers
              </h3>
              <p className="text-white/70 mb-6">
                Completa nuestro formulario de registro y te contactaremos para verificar tu perfil 
                y darte acceso a nuestro deal flow cualificado.
              </p>
              <div className="space-y-4">
                <Button asChild size="lg" className="w-full bg-white text-slate-900 hover:bg-white/90">
                  <Link to="/contacto?origen=search-funds-searcher">
                    Registrarme como Searcher
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-xs text-white/50 text-center">
                  Proceso de verificación en 48-72h. Sin coste hasta encontrar empresa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
