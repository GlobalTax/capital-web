
import React from 'react';

const About = () => {
  return (
    <section className="py-32 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        {/* Main Content */}
        <div className="text-center mb-24">
          <h2 className="text-2xl font-light text-black mb-8">
            Nuestro Enfoque
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Un ecosistema integral de más de 70 especialistas trabajando de forma coordinada 
            para maximizar el valor de cada transacción desde el primer día.
          </p>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
          <div className="text-center">
            <h3 className="text-lg font-medium text-black mb-4">
              Abogados
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Especialistas en derecho mercantil y transacciones empresariales.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-black mb-4">
              Asesores Fiscales
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Expertos en optimización fiscal y planificación tributaria.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-black mb-4">
              Asesores Laborales
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Especialistas en derecho laboral y gestión del capital humano.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-black mb-4">
              Economistas
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Expertos en análisis financiero y valoraciones precisas.
            </p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="text-center border-t border-gray-200 pt-24">
          <h3 className="text-2xl font-light text-black mb-8">
            Nuestro Compromiso
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            No solo ejecutamos transacciones, creamos valor. Tu éxito es nuestro éxito.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
