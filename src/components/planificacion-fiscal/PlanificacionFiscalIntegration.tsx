import React from 'react';

const PlanificacionFiscalIntegration = () => {

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Solución Integral M&A
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Capittal trabaja junto a expertos legales y financieros para ofrecerte 
            una solución integral en todas las fases de tu operación.
          </p>
          
          <div className="bg-white/10 border border-white/20 rounded-lg p-6 max-w-4xl mx-auto">
            <p className="text-white text-lg font-medium mb-2">
              "La planificación fiscal no es un elemento aislado"
            </p>
            <p className="text-gray-300">
              Integramos la optimización fiscal con la estrategia legal, financiera y operativa 
              para maximizar el valor de tu transacción desde todos los ángulos.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <div className="bg-white/5 border border-white/20 rounded-lg p-8 text-center hover:bg-white/10 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-4">Contacto Directo</h3>
            <div className="space-y-3">
              <a href="tel:620273552" className="block text-white text-lg hover:text-gray-300 transition-colors">
                📞 620 273 552
              </a>
              <a href="mailto:samuel@capittal.es" className="block text-white text-lg hover:text-gray-300 transition-colors">
                ✉️ samuel@capittal.es
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">360°</div>
              <div className="text-gray-400">Enfoque integral</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-400">Asesores colaboradores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-gray-400">Coordinación garantizada</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanificacionFiscalIntegration;