
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { useCaseStudies } from '@/hooks/useCaseStudies';

const CaseStudies = () => {
  const { caseStudies, isLoading } = useCaseStudies();

  // Get featured cases from database, fallback to all cases if no featured ones
  const featuredCases = React.useMemo(() => {
    if (!caseStudies || caseStudies.length === 0) return [];
    
    // First try to get featured cases, then all cases, limit to 6
    const featured = caseStudies.filter(case_ => case_.is_featured);
    const displayCases = featured.length > 0 ? featured : caseStudies;
    
    return displayCases
      .slice(0, 6)
      .map(case_ => ({
        id: case_.id,
        title: case_.title,
        sector: case_.sector,
        value: case_.value_amount ? Math.round(case_.value_amount / 1000000).toString() : "N/A",
        currency: case_.value_currency || "€",
        year: case_.year?.toString() || "N/A",
        description: case_.description,
        logo_url: case_.logo_url,
        featured_image_url: case_.featured_image_url,
        highlights: case_.highlights || []
      }));
  }, [caseStudies]);

  if (isLoading) {
    return (
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-16"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-6">
            Casos de Éxito
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Resultados Excepcionales
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-16">
            Más de 500 transacciones exitosas que demuestran nuestra capacidad para maximizar 
            el valor en cada operación.
          </p>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <div className="text-3xl font-bold text-black mb-2">500+</div>
            <div className="text-sm text-gray-600 font-medium">Transacciones</div>
          </div>
          
          <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <div className="text-3xl font-bold text-black mb-2">€5B+</div>
            <div className="text-sm text-gray-600 font-medium">Valor Gestionado</div>
          </div>
          
          <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <div className="text-3xl font-bold text-black mb-2">25+</div>
            <div className="text-sm text-gray-600 font-medium">Años Experiencia</div>
          </div>
          
          <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <div className="text-3xl font-bold text-black mb-2">98,7%</div>
            <div className="text-sm text-gray-600 font-medium">Tasa Éxito</div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCases.length > 0 ? (
            featuredCases.map((case_) => (
              <div key={case_.id} className="bg-white border-0.5 border-border rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
                {/* Featured Image */}
                {case_.featured_image_url && (
                  <div className="w-full h-48 bg-gray-100 overflow-hidden">
                    <img 
                      src={case_.featured_image_url} 
                      alt={case_.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium mb-4">
                    {case_.sector} • {case_.year}
                  </div>
                  
                  {/* Logo if available */}
                  {case_.logo_url && (
                    <div className="w-12 h-12 mb-4 bg-gray-50 rounded-lg p-2 overflow-hidden">
                      <img 
                        src={case_.logo_url} 
                        alt={`${case_.title} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.parentElement.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-black mb-4">
                    {case_.title}
                  </h3>
                  
                  <div className="text-2xl font-bold text-black mb-4 bg-black text-white px-4 py-2 rounded-lg inline-block">
                    {case_.currency}{case_.value}M
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {case_.description}
                  </p>
                  
                  {/* Highlights */}
                  {case_.highlights && case_.highlights.length > 0 && (
                    <div className="space-y-2">
                      {case_.highlights.slice(0, 3).map((highlight, idx) => (
                        <div key={idx} className="text-sm text-gray-500 flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                          {highlight}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg">
                No hay casos de éxito disponibles en este momento.
              </div>
              <div className="text-gray-400 text-sm mt-2">
                Los casos se mostrarán una vez que se agreguen desde el panel administrativo.
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-white border-0.5 border-border rounded-lg p-12 shadow-sm text-center mt-20">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-6">
            Empezar Ahora
          </div>
          
          <h3 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Listo para ser nuestro próximo caso de éxito?
          </h3>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Solicita una evaluación gratuita y descubre el verdadero potencial de tu negocio.
          </p>

          <div className="flex justify-center">
            <InteractiveHoverButton 
              text="Evaluar"
              variant="primary"
              size="lg"
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Sin compromiso • Confidencial • Resultados en 48h
          </p>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
