import { FileSearch, Users, Scale, FileCheck, Handshake, CheckCircle } from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: FileSearch,
    title: "Valoración inicial",
    description: "Realizamos una valoración gratuita de tu empresa para determinar si encaja con el perfil de Search Funds.",
    forSeller: true,
    forSearcher: false
  },
  {
    number: "02",
    icon: Users,
    title: "Matching cualificado",
    description: "Identificamos Searchers verificados cuyos criterios encajan con tu empresa y te los presentamos de forma confidencial.",
    forSeller: true,
    forSearcher: true
  },
  {
    number: "03",
    icon: Scale,
    title: "Negociación estructurada",
    description: "Facilitamos las conversaciones iniciales, LOI y estructuración del deal protegiendo tus intereses.",
    forSeller: true,
    forSearcher: true
  },
  {
    number: "04",
    icon: FileCheck,
    title: "Due Diligence",
    description: "Coordinamos el proceso de due diligence financiero, legal y operativo para ambas partes.",
    forSeller: true,
    forSearcher: true
  },
  {
    number: "05",
    icon: Handshake,
    title: "Cierre de operación",
    description: "Acompañamos hasta la firma del SPA y transferencia, asegurando una transición ordenada.",
    forSeller: true,
    forSearcher: true
  },
  {
    number: "06",
    icon: CheckCircle,
    title: "Post-cierre",
    description: "Soporte durante el período de transición para garantizar el éxito de la operación.",
    forSeller: true,
    forSearcher: true
  }
];

export const SearchFundsProcess = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Nuestro proceso
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
              Cómo trabajamos con Search Funds
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Un proceso estructurado y profesional que protege a ambas partes 
              y maximiza las probabilidades de éxito de la operación.
            </p>
          </div>

          {/* Process Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="relative flex gap-6 items-start group"
              >
                {/* Number and Icon */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-full min-h-[2rem] bg-border mt-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                      PASO {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Note */}
          <div className="mt-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 text-center">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Tiempo estimado del proceso:</strong> 6-12 meses desde el primer contacto hasta el cierre. 
              Cada operación es única y el timing depende de la complejidad y las partes involucradas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
