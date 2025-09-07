import React, { useMemo } from 'react';
import { TrendingUp, Calculator, Building2, FileSearch, Scale, Receipt, Users, BarChart3, Briefcase, GraduationCap } from 'lucide-react';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { useStatistics, extractNumericValue, extractSuffix } from '@/hooks/useStatistics';

const EcosistemaIntegral = () => {
  const { data: dbStatistics, isLoading } = useStatistics('home');

  // Always call hooks at the top level
  const professionalsCount = useCountAnimation(60, 2000, '+');
  const fallbackOperationsCount = useCountAnimation(100, 2000, '+');
  const fallbackYearsCount = useCountAnimation(25, 2000, '+');
  const fallbackSuccessCount = useCountAnimation(98.7, 2000, '%');

  // Create individual hooks for database statistics (up to 4 to match fallback count)
  const dbStat1 = useCountAnimation(
    dbStatistics?.[0] ? extractNumericValue(dbStatistics[0].metric_value) : 0, 
    2000, 
    dbStatistics?.[0] ? extractSuffix(dbStatistics[0].metric_value) : ''
  );
  const dbStat2 = useCountAnimation(
    dbStatistics?.[1] ? extractNumericValue(dbStatistics[1].metric_value) : 0, 
    2000, 
    dbStatistics?.[1] ? extractSuffix(dbStatistics[1].metric_value) : ''
  );
  const dbStat3 = useCountAnimation(
    dbStatistics?.[2] ? extractNumericValue(dbStatistics[2].metric_value) : 0, 
    2000, 
    dbStatistics?.[2] ? extractSuffix(dbStatistics[2].metric_value) : ''
  );

  // Create statistics array using memoization
  const statistics = useMemo(() => {
    if (!dbStatistics || dbStatistics.length === 0) {
      return [
        {
          value: professionalsCount.count,
          label: "Profesionales Especializados",
          ref: professionalsCount.ref
        },
        {
          value: fallbackOperationsCount.count,
          label: "Operaciones Completadas", 
          ref: fallbackOperationsCount.ref
        },
        {
          value: fallbackYearsCount.count,
          label: "Años de Experiencia",
          ref: fallbackYearsCount.ref
        },
        {
          value: fallbackSuccessCount.count,
          label: "Tasa de Éxito",
          ref: fallbackSuccessCount.ref
        }
      ];
    }

    // Use database statistics with pre-created hooks
    const dbStats = [];
    const animatedHooks = [dbStat1, dbStat2, dbStat3];
    
    for (let i = 0; i < Math.min(dbStatistics.length, 3); i++) {
      if (dbStatistics[i]) {
        dbStats.push({
          value: animatedHooks[i].count,
          label: dbStatistics[i].metric_label,
          ref: animatedHooks[i].ref
        });
      }
    }

    // Add professionals count first, then database stats
    return [
      {
        value: professionalsCount.count,
        label: "Profesionales Especializados",
        ref: professionalsCount.ref
      },
      ...dbStats
    ];
  }, [
    dbStatistics, 
    professionalsCount.count, 
    fallbackOperationsCount.count, 
    fallbackYearsCount.count, 
    fallbackSuccessCount.count,
    dbStat1.count,
    dbStat2.count,
    dbStat3.count
  ]);

  const ecosystemServices = [
    {
      title: "M&A Advisory",
      description: "Especialistas en fusiones y adquisiciones para maximizar el valor de tu empresa",
      icon: TrendingUp
    },
    {
      title: "Valoraciones",
      description: "Expertos en valoración empresarial y análisis financiero detallado",
      icon: Calculator
    },
    {
      title: "Asesoramiento Legal",
      description: "Apoyo jurídico especializado en derecho mercantil y operaciones M&A",
      icon: Scale
    },
    {
      title: "Planificación Fiscal",
      description: "Optimización tributaria y estructuración fiscal estratégica",
      icon: Receipt
    },
    {
      title: "Corporate Finance",
      description: "Estructuración financiera y levantamiento de capital estratégico",
      icon: Building2
    },
    {
      title: "Due Diligence",
      description: "Análisis exhaustivo de riesgos y oportunidades de inversión",
      icon: FileSearch
    }
  ];

  const professionalProfiles = [
    {
      title: "Analistas Financieros",
      description: "Expertos en modelado financiero y análisis de valoración",
      icon: BarChart3
    },
    {
      title: "Abogados",
      description: "Especialistas en derecho mercantil y asesoramiento legal M&A",
      icon: Scale
    },
    {
      title: "Economistas",
      description: "Expertos en análisis sectorial y valoración macroeconómica",
      icon: TrendingUp
    },
    {
      title: "Fiscalistas",
      description: "Especialistas en optimización tributaria y planificación fiscal",
      icon: Receipt
    }
  ];

  // Add loading state check
  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Cargando métricas...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-6">
            Ecosistema Completo
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Ecosistema Integral de M&A
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Contamos con un equipo multidisciplinar de más de <strong className="text-black">60 profesionales especializados</strong>: 
            analistas financieros, abogados, economistas y fiscalistas que trabajan de forma integrada 
            para ofrecer soluciones completas en todas tus necesidades empresariales de M&A.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {statistics.map((stat, index) => (
            <div 
              key={index} 
              ref={stat.ref}
              className="text-center bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Ecosystem Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {ecosystemServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-black rounded-lg mb-4">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-black mb-3">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Professional Profiles */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
              Equipo Multidisciplinar
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Nuestro equipo de más de 60 profesionales combina diferentes especialidades 
              para ofrecer una perspectiva integral en cada proyecto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {professionalProfiles.map((profile, index) => {
              const IconComponent = profile.icon;
              return (
                <div 
                  key={index} 
                  className="bg-gray-100 rounded-lg p-6 border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 ease-out"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-lg mb-4">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  
                  <h4 className="text-base font-bold text-black mb-2">
                    {profile.title}
                  </h4>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {profile.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commitment Message */}
        <div className="text-center bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-black mb-4">
            Nuestro Compromiso
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Creamos valor a través de un <strong className="text-black">enfoque integral y multidisciplinar</strong>, 
            donde nuestro equipo de analistas financieros, abogados, economistas y fiscalistas trabajan 
            de forma coordinada para garantizar el éxito de cada operación y maximizar el valor para nuestros clientes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EcosistemaIntegral;