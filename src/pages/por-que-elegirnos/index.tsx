
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PorQueElegirnosHero from '@/components/por-que-elegirnos/PorQueElegirnosHero';
import PorQueElegirnosExperience from '@/components/por-que-elegirnos/PorQueElegirnosExperience';
import PorQueElegirnosApproach from '@/components/por-que-elegirnos/PorQueElegirnosApproach';
import PorQueElegirnosResults from '@/components/por-que-elegirnos/PorQueElegirnosResults';
import PorQueElegirnosTestimonials from '@/components/por-que-elegirnos/PorQueElegirnosTestimonials';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const PorQueElegirnos = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <PorQueElegirnosHero />
        
        {/* Navigation to sub-pages */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">
                Descubre Por Qué Somos Diferentes
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Explora en detalle nuestra experiencia, metodología y los resultados que obtenemos
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link to="/por-que-elegirnos/experiencia" className="group">
                <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
                  <h3 className="text-xl font-bold text-black mb-4">Nuestra Experiencia</h3>
                  <p className="text-gray-600 mb-6">
                    Más de 15 años especializados exclusivamente en M&A con un track record excepcional
                  </p>
                  <InteractiveHoverButton 
                    text="Ver Experiencia"
                    variant="default"
                    size="default"
                  />
                </div>
              </Link>
              
              <Link to="/por-que-elegirnos/metodologia" className="group">
                <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
                  <h3 className="text-xl font-bold text-black mb-4">Metodología</h3>
                  <p className="text-gray-600 mb-6">
                    Proceso optimizado y probado que maximiza el valor de cada transacción
                  </p>
                  <InteractiveHoverButton 
                    text="Ver Metodología"
                    variant="default"
                    size="default"
                  />
                </div>
              </Link>
              
              <Link to="/por-que-elegirnos/resultados" className="group">
                <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
                  <h3 className="text-xl font-bold text-black mb-4">Resultados</h3>
                  <p className="text-gray-600 mb-6">
                    Datos y métricas que demuestran nuestro éxito en cada operación
                  </p>
                  <InteractiveHoverButton 
                    text="Ver Resultados"
                    variant="default"
                    size="default"
                  />
                </div>
              </Link>
            </div>
          </div>
        </section>
        
        <PorQueElegirnosExperience />
        <PorQueElegirnosApproach />
        <PorQueElegirnosTestimonials />
        <PorQueElegirnosResults />
      </div>
      <Footer />
    </div>
  );
};

export default PorQueElegirnos;
