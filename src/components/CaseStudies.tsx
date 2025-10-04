
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleButton } from '@/components/ui/simple-button';
import { useCaseStudies } from '@/hooks/useCaseStudies';

const CaseStudies = () => {
  const navigate = useNavigate();
  const { caseStudies, isLoading } = useCaseStudies();

  const handleContactClick = () => {
    navigate('/contacto');
  };

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
        value: case_.is_value_confidential 
          ? "Confidencial"
          : case_.value_amount 
            ? `${case_.value_amount}M`
            : "N/A",
        isValueConfidential: case_.is_value_confidential || false,
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
        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCases.length > 0 ? (
            featuredCases.map((case_) => (
              <div key={case_.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out group">
                {/* Featured Image */}
                {case_.featured_image_url && (
                  <div className="w-full h-48 bg-gray-100 overflow-hidden">
                    <img 
                      src={case_.featured_image_url} 
                      alt={case_.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center px-3 py-1.5 bg-card text-primary rounded-full text-sm font-semibold border border-border">
                      {case_.sector} • {case_.year}
                    </div>
                    
                    {/* Logo - much larger and more prominent */}
                    {case_.logo_url && (
                      <div className="w-28 h-28 bg-gray-50 rounded-lg p-3 overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200">
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
                  </div>
                  
                  <h3 className="text-xl font-bold text-black mb-4 leading-tight group-hover:text-blue-700 transition-colors duration-200">
                    {case_.title}
                  </h3>
                  
                  {/* Value display with confidential handling */}
                  <div className="mb-4">
                    {case_.isValueConfidential ? (
                      <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg border border-orange-200">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-bold">Confidencial</span>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-white bg-black px-4 py-2 rounded-lg inline-block">
                        {case_.currency}{case_.value}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {case_.description}
                  </p>
                  
                  {/* Highlights */}
                  {case_.highlights && case_.highlights.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Destacados:</h4>
                      {case_.highlights.slice(0, 3).map((highlight, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="leading-relaxed">{highlight}</span>
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
            Solicita una valoración gratuita y descubre el verdadero potencial de tu negocio.
          </p>

          <div className="flex justify-center">
            <SimpleButton 
              text="Contacta"
              variant="primary"
              size="lg"
              onClick={handleContactClick}
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
