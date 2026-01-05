import { Shield, Eye, FileCheck, Users, CheckCircle, Award } from 'lucide-react';

const differentiators = [
  {
    icon: Eye,
    title: "Filtrado riguroso",
    description: "Verificamos la seriedad, experiencia y capacidad financiera de cada Searcher antes de presentarlo a nuestros clientes."
  },
  {
    icon: FileCheck,
    title: "Due Diligence inverso",
    description: "Ayudamos a empresarios a evaluar si un Searcher es adecuado para su empresa mediante un proceso estructurado."
  },
  {
    icon: Shield,
    title: "Confidencialidad garantizada",
    description: "Protegemos la identidad de tu empresa durante todo el proceso hasta que decidas avanzar con un Searcher específico."
  },
  {
    icon: Users,
    title: "Red de inversores verificados",
    description: "Trabajamos con Search Funds respaldados por instituciones reconocidas y family offices de primer nivel."
  },
  {
    icon: Award,
    title: "Experiencia en M&A",
    description: "Más de 500 valoraciones realizadas y operaciones cerradas desde €1M hasta €20M en múltiples sectores."
  },
  {
    icon: CheckCircle,
    title: "Acompañamiento completo",
    description: "Te guiamos desde la valoración inicial hasta el cierre, incluyendo negociación, due diligence y documentación legal."
  }
];

export const SearchFundsWhyCapittal = () => {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Nuestra propuesta de valor
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
              ¿Por qué trabajar con Capittal?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Entendemos las dudas que surgen ante un modelo relativamente nuevo. 
              Por eso aportamos transparencia, estructura y acompañamiento en cada paso del proceso.
            </p>
          </div>

          {/* Problem Statement */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-12">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3">
              El problema que resolvemos
            </h3>
            <p className="text-red-700 dark:text-red-400">
              Muchos empresarios españoles desconfían de los Search Funds porque han tenido malas experiencias 
              con "inversores" poco serios o porque desconocen el modelo. Algunos Searchers, sin experiencia 
              en M&A, abordan a empresarios de forma poco profesional, generando rechazo hacia todo el sector.
            </p>
          </div>

          {/* Differentiators Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentiators.map((item, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Quote */}
          <blockquote className="mt-12 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-2xl p-8 border-l-4 border-primary">
            <p className="text-lg text-foreground italic mb-4">
              "Los Search Funds son emprendedores de primer nivel que invierten su propio futuro en tu empresa. 
              Nosotros filtramos los serios de los oportunistas."
            </p>
            <footer className="text-sm text-muted-foreground">
              — Equipo de M&A, Capittal
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
};
