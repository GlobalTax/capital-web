import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';

const NavarroIndex: React.FC = () => {
  return (
    <UnifiedLayout variant="navarro">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Navarro
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Asesoría legal, fiscal y laboral especializada
            </p>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Parte del Grupo Navarro, trabajamos de forma integrada con Capittal 
              para ofrecer soluciones completas a empresas y emprendedores.
            </p>
          </div>
        </div>
      </section>

      {/* Servicios principales */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-lg text-gray-600">
              Asesoramiento especializado en todas las áreas legales y fiscales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Asesoría Legal */}
            <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-black mb-4">
                Asesoría Legal
              </h3>
              <p className="text-gray-600 mb-6">
                Derecho mercantil, contratos, compliance, protección de datos y más.
              </p>
              <a 
                href="/navarro/legal" 
                className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                Más información
              </a>
            </div>

            {/* Asesoría Fiscal */}
            <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-black mb-4">
                Asesoría Fiscal
              </h3>
              <p className="text-gray-600 mb-6">
                Planificación fiscal, optimización tributaria y cumplimiento normativo.
              </p>
              <a 
                href="/navarro/fiscal" 
                className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                Más información
              </a>
            </div>

            {/* Asesoría Laboral */}
            <div className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-black mb-4">
                Asesoría Laboral
              </h3>
              <p className="text-gray-600 mb-6">
                Gestión de nóminas, contratos laborales y relaciones industriales.
              </p>
              <a 
                href="/navarro/laboral" 
                className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                Más información
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Integración con Capittal */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black mb-6">
              Trabajamos Integrados con Capittal
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Como parte del Grupo Navarro, colaboramos estrechamente con Capittal 
              para ofrecer servicios completos de valoración, venta y asesoramiento empresarial.
            </p>
            <a 
              href="/" 
              className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Conocer Capittal
            </a>
          </div>
        </div>
      </section>
    </UnifiedLayout>
  );
};

export default NavarroIndex;