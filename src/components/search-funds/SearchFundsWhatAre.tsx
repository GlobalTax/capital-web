import { CheckCircle, Users, Clock, TrendingUp, Briefcase } from 'lucide-react';

const phases = [
  {
    number: "1",
    title: "Formación",
    description: "El Searcher recauda capital de inversores para financiar la búsqueda",
    duration: "3-6 meses",
    icon: Users
  },
  {
    number: "2", 
    title: "Búsqueda",
    description: "Identificación y análisis de empresas objetivo con criterios específicos",
    duration: "12-24 meses",
    icon: Briefcase
  },
  {
    number: "3",
    title: "Adquisición y Gestión",
    description: "El Searcher adquiere la empresa y asume el rol de CEO",
    duration: "5-7 años",
    icon: TrendingUp
  },
  {
    number: "4",
    title: "Exit",
    description: "Venta de la empresa con retorno para inversores y Searcher",
    duration: "Variable",
    icon: CheckCircle
  }
];

const characteristics = [
  "Emprendedores de alto nivel (MBA de escuelas top como IESE, ESADE)",
  "Capital respaldado por inversores institucionales y family offices",
  "Horizonte de inversión largo (5-7 años) vs PE tradicional (3-5 años)",
  "El Searcher se convierte en CEO y gestiona personalmente la empresa",
  "Empresas objetivo: €1M-€5M EBITDA, sectores estables, propietario que quiere retirarse",
  "España es el país #1 de Europa en Search Funds con más de 67 creados"
];

export const SearchFundsWhatAre = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Entendiendo el modelo
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-foreground mt-4 mb-6">
              ¿Qué es un Search Fund? Guía completa para empresarios
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Un Search Fund es un modelo de "emprendimiento a través de la adquisición" donde un emprendedor 
              (el "Searcher") recauda capital para buscar, adquirir y dirigir una empresa existente con 
              potencial de crecimiento.
            </p>
          </div>

          {/* 4 Phases */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {phases.map((phase) => (
              <div key={phase.number} className="relative">
                <div className="bg-card border border-border rounded-xl p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">{phase.number}</span>
                    </div>
                    <phase.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{phase.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Clock className="w-3 h-3" />
                    <span>{phase.duration}</span>
                  </div>
                </div>
                {/* Connector line for desktop */}
                {phase.number !== "4" && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>

          {/* Key Characteristics */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Características clave de los Search Funds
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {characteristics.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
