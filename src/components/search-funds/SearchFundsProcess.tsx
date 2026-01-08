import { motion } from 'framer-motion';
import { FileSearch, Users, Scale, FileCheck, Handshake, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const steps = [
  {
    number: "01",
    icon: FileSearch,
    title: "Valoración inicial",
    description: "Realizamos una valoración gratuita de tu empresa para determinar si encaja con el perfil de Search Funds.",
    duration: "1-2 semanas",
    details: "Análisis de métricas financieras, sector, equipo y potencial de crecimiento.",
    forSeller: true,
    forSearcher: false
  },
  {
    number: "02",
    icon: Users,
    title: "Matching cualificado",
    description: "Identificamos Searchers verificados cuyos criterios encajan con tu empresa y te los presentamos de forma confidencial.",
    duration: "2-4 semanas",
    details: "Acceso a nuestra red de 21+ searchers activos con perfil verificado.",
    forSeller: true,
    forSearcher: true
  },
  {
    number: "03",
    icon: Scale,
    title: "Negociación estructurada",
    description: "Facilitamos las conversaciones iniciales, LOI y estructuración del deal protegiendo tus intereses.",
    duration: "4-8 semanas",
    details: "Asesoramiento en términos, earn-outs, garantías y estructura fiscal.",
    forSeller: true,
    forSearcher: true
  },
  {
    number: "04",
    icon: FileCheck,
    title: "Due Diligence",
    description: "Coordinamos el proceso de due diligence financiero, legal y operativo para ambas partes.",
    duration: "6-10 semanas",
    details: "Data room virtual, coordinación con asesores externos y gestión de hallazgos.",
    forSeller: true,
    forSearcher: true
  },
  {
    number: "05",
    icon: Handshake,
    title: "Cierre de operación",
    description: "Acompañamos hasta la firma del SPA y transferencia, asegurando una transición ordenada.",
    duration: "2-4 semanas",
    details: "Revisión final de documentación, firma ante notario y transferencia de acciones.",
    forSeller: true,
    forSearcher: true
  },
  {
    number: "06",
    icon: CheckCircle,
    title: "Post-cierre",
    description: "Soporte durante el período de transición para garantizar el éxito de la operación.",
    duration: "3-6 meses",
    details: "Acompañamiento al nuevo CEO, traspaso de relaciones clave y seguimiento.",
    forSeller: true,
    forSearcher: true
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 }
  }
};

export const SearchFundsProcess = () => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Nuestro proceso
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-foreground mt-4 mb-6">
              Proceso de venta a Search Funds: Paso a paso
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Un proceso estructurado y profesional que protege a ambas partes 
              y maximiza las probabilidades de éxito de la operación.
            </p>
          </motion.div>

          {/* Process Steps */}
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {steps.map((step, index) => {
              const isExpanded = expandedStep === step.number;
              const Icon = step.icon;
              
              return (
                <motion.div 
                  key={step.number}
                  variants={itemVariants}
                  className="relative"
                >
                  <div 
                    className={cn(
                      "relative flex gap-4 md:gap-6 items-start p-4 md:p-6 rounded-2xl border transition-all cursor-pointer",
                      isExpanded 
                        ? "bg-primary/5 border-primary/30 shadow-lg" 
                        : "bg-background border-border hover:border-primary/30 hover:shadow-md"
                    )}
                    onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                  >
                    {/* Number and Icon */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <motion.div 
                        className={cn(
                          "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-colors",
                          isExpanded ? "bg-primary text-primary-foreground" : "bg-primary/10"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className={cn("w-6 h-6 md:w-7 md:h-7", !isExpanded && "text-primary")} />
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                          PASO {step.number}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {step.duration}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {step.description}
                      </p>
                      
                      {/* Expanded Details */}
                      <motion.div
                        initial={false}
                        animate={{ 
                          height: isExpanded ? "auto" : 0,
                          opacity: isExpanded ? 1 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-sm text-foreground/80 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            {step.details}
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Expand indicator */}
                    <div className="flex-shrink-0 self-center">
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-[1.75rem] md:left-[2.25rem] top-[4.5rem] md:top-[5rem] w-0.5 h-4 bg-border" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Timeline Note */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6"
          >
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <p className="font-semibold text-foreground mb-1">
                  Tiempo estimado total: 6-12 meses
                </p>
                <p className="text-sm text-muted-foreground">
                  Cada operación es única. El timing depende de la complejidad y disponibilidad de las partes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
