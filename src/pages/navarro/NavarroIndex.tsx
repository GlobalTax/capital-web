import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { ArrowRight, Building2, Scale, Users, FileText, TrendingUp, Globe } from 'lucide-react';

const NavarroIndex: React.FC = () => {
  return (
    <UnifiedLayout variant="navarro">
      {/* Hero Section */}
      <section className="bg-black text-white min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-wider mb-8 text-gray-400">
              BIENVENIDO A NAVARRO & ASOCIADOS
            </p>
            <h1 className="text-5xl md:text-7xl font-light mb-8 leading-tight">
              Líderes locales con{' '}
              <span className="italic">visión global</span>.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl font-light">
              La firma española líder para empresas internacionales y emprendedores 
              que buscan crecer globalmente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-black px-8 py-4 text-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center group">
                Nuestros Servicios
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-white text-white px-8 py-4 text-lg font-medium hover:bg-white hover:text-black transition-colors">
                Contactar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm uppercase tracking-wider mb-6 text-gray-600">
                Nuestro enfoque.
              </h2>
              <p className="text-xl text-gray-800 leading-relaxed">
                En Navarro & Asociados, integramos experiencia global con conocimiento local 
                para ofrecer servicios legales, contables y fiscales personalizados a empresas. 
                Nuestras soluciones garantizan el cumplimiento normativo, optimizan la tributación 
                y impulsan el crecimiento, convirtiéndonos en su socio estratégico esencial 
                en España y más allá.
              </p>
              <div className="mt-8">
                <p className="text-lg font-medium text-black">Samuel Navarro</p>
                <p className="text-gray-600">CEO & Fundador</p>
              </div>
            </div>
            <div className="bg-gray-100 h-96 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Foto del fundador</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-black mb-6">
              Servicios Especializados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Soluciones integrales para empresas que buscan excelencia 
              en asesoramiento legal, fiscal y laboral
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Legal */}
            <div className="bg-white p-8 group hover:shadow-xl transition-all duration-300">
              <div className="mb-6">
                <Scale className="h-12 w-12 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">
                Asesoría Legal
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Derecho mercantil, contratos internacionales, compliance regulatorio, 
                protección de datos y constitución de sociedades.
              </p>
              <a 
                href="/navarro/legal" 
                className="inline-flex items-center text-black font-medium group-hover:underline"
              >
                Más información
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Fiscal */}
            <div className="bg-white p-8 group hover:shadow-xl transition-all duration-300">
              <div className="mb-6">
                <FileText className="h-12 w-12 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">
                Asesoría Fiscal
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Planificación fiscal internacional, optimización tributaria, 
                cumplimiento normativo y estructuración de inversiones.
              </p>
              <a 
                href="/navarro/fiscal" 
                className="inline-flex items-center text-black font-medium group-hover:underline"
              >
                Más información
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Laboral */}
            <div className="bg-white p-8 group hover:shadow-xl transition-all duration-300">
              <div className="mb-6">
                <Users className="h-12 w-12 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">
                Asesoría Laboral
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Gestión integral de nóminas, contratos laborales, 
                relaciones industriales y expatriación de ejecutivos.
              </p>
              <a 
                href="/navarro/laboral" 
                className="inline-flex items-center text-black font-medium group-hover:underline"
              >
                Más información
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Constitución */}
            <div className="bg-white p-8 group hover:shadow-xl transition-all duration-300">
              <div className="mb-6">
                <Building2 className="h-12 w-12 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">
                Constitución de Sociedades
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Enfoque confiable y eficiente para establecer su subsidiaria 
                extranjera en España con total seguridad jurídica.
              </p>
              <a 
                href="/navarro/constitucion" 
                className="inline-flex items-center text-black font-medium group-hover:underline"
              >
                Más información
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Gestión */}
            <div className="bg-white p-8 group hover:shadow-xl transition-all duration-300">
              <div className="mb-6">
                <TrendingUp className="h-12 w-12 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">
                Gestión Empresarial
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Servicios de gestión integral para empresas establecidas, 
                optimización de procesos y crecimiento sostenible.
              </p>
              <a 
                href="/navarro/gestion" 
                className="inline-flex items-center text-black font-medium group-hover:underline"
              >
                Más información
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Internacional */}
            <div className="bg-white p-8 group hover:shadow-xl transition-all duration-300">
              <div className="mb-6">
                <Globe className="h-12 w-12 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">
                Servicios Internacionales
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Expansión internacional, estructuras globales y asesoramiento 
                para empresas multinacionales en mercados europeos.
              </p>
              <a 
                href="/navarro/internacional" 
                className="inline-flex items-center text-black font-medium group-hover:underline"
              >
                Más información
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-light text-black mb-4">
              Conoce a nuestros socios estratégicos en nuestro viaje internacional
            </h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            <div className="text-center">
              <div className="bg-gray-200 h-16 w-32 flex items-center justify-center text-gray-600 font-medium">
                Partner 1
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gray-200 h-16 w-32 flex items-center justify-center text-gray-600 font-medium">
                Partner 2
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gray-200 h-16 w-32 flex items-center justify-center text-gray-600 font-medium">
                Partner 3
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-8">
            ¿Listo para expandir su negocio?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Contacte con nuestro equipo de expertos para una consulta personalizada 
            sobre sus necesidades empresariales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-black px-8 py-4 text-lg font-medium hover:bg-gray-100 transition-colors">
              Solicitar Consulta
            </button>
            <button className="border border-white text-white px-8 py-4 text-lg font-medium hover:bg-white hover:text-black transition-colors">
              Ver Casos de Éxito
            </button>
          </div>
        </div>
      </section>
    </UnifiedLayout>
  );
};

export default NavarroIndex;