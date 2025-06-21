
import React from 'react';

const About = () => {
  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Gestión Integral de Procesos de Compraventa
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Capittal forma parte del Grupo Navarro, un ecosistema integral de servicios profesionales 
            que garantiza el éxito de cada transacción. Contamos con más de 70 especialistas que 
            trabajan de forma coordinada para maximizar el valor de tu operación desde el primer día.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            <div className="text-3xl font-bold text-black mb-2">70+</div>
            <div className="text-gray-600 font-medium text-base">Profesionales</div>
          </div>
          
          <div className="text-center bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            <div className="text-3xl font-bold text-black mb-2">15+</div>
            <div className="text-gray-600 font-medium text-base">Años Experiencia</div>
          </div>
          
          <div className="text-center bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            <div className="text-3xl font-bold text-black mb-2">4</div>
            <div className="text-gray-600 font-medium text-base">Especialidades</div>
          </div>
          
          <div className="text-center bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            <div className="text-3xl font-bold text-black mb-2">100%</div>
            <div className="text-gray-600 font-medium text-base">Dedicación</div>
          </div>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-lg font-semibold text-black mb-2">
              Abogados
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Especialistas en derecho mercantil y transacciones empresariales
            </p>
          </div>

          <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-lg font-semibold text-black mb-2">
              Asesores Fiscales
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Expertos en optimización fiscal y planificación tributaria
            </p>
          </div>

          <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-lg font-semibold text-black mb-2">
              Asesores Laborales
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Especialistas en derecho laboral y recursos humanos
            </p>
          </div>

          <div className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-lg font-semibold text-black mb-2">
              Economistas
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Expertos en gestión empresarial y análisis financiero
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
