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
                className="group bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 
                           hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Número decorativo + Icono */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 
                                  flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-4xl font-bold text-slate-100 dark:text-slate-700 select-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                
                {/* Título */}
                <h3 className="font-bold text-lg text-foreground mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                
                {/* Descripción */}
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
