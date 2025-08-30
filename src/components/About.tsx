
import React from 'react';

const About = () => {
  return (
    <section id="nosotros" className="py-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-light text-black mb-2">25+</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">Años Experiencia</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-light text-black mb-2">500+</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">Transacciones</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-light text-black mb-2">€5B+</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">Valor Gestionado</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-light text-black mb-2">95%</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">Tasa Éxito</div>
          </div>
        </div>

        {/* Ecosystem Section */}
        <div className="mb-20 text-center">
          <h3 className="text-xl font-bold text-black mb-6">
            Ecosistema Integral del Grupo Navarro
          </h3>
          <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Nuestro enfoque multidisciplinar nos permite cubrir todas las áreas críticas de una transacción M&A. 
            Desde el análisis legal hasta la optimización fiscal, pasando por la gestión laboral y el análisis 
            financiero, cada especialista aporta su experiencia para garantizar el éxito de tu operación.
          </p>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-black mb-3">
              Abogados
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Especialistas en derecho mercantil y transacciones empresariales con amplia experiencia en operaciones complejas.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-black mb-3">
              Asesores Fiscales
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Expertos en optimización fiscal y planificación tributaria para maximizar la eficiencia de cada transacción.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-black mb-3">
              Asesores Laborales
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Especialistas en derecho laboral y recursos humanos para gestionar aspectos críticos del capital humano.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-black mb-3">
              Economistas
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Expertos en gestión empresarial y análisis financiero para valoraciones precisas y estrategias sólidas.
            </p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-20 text-center">
          <h3 className="text-xl font-bold text-black mb-6">
            Nuestro Compromiso
          </h3>
          <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
            En Capittal, no solo ejecutamos transacciones, creamos valor. Nuestro enfoque integral y 
            la experiencia combinada de nuestros especialistas nos permite identificar oportunidades, 
            mitigar riesgos y maximizar el retorno de cada operación. Tu éxito es nuestro éxito.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
