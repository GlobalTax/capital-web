import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorStats from '@/components/sector/SectorStats';
import { Factory, Cog, Truck, Zap } from 'lucide-react';

const Industrial = () => {
  const stats = [
    { number: "18%", label: "Crecimiento industrial anual" },
    { number: "7.2x", label: "Múltiplo EBITDA promedio" },
    { number: "200+", label: "Empresas industriales valoradas" },
    { number: "92%", label: "Precisión en valoraciones" }
  ];

  const expertise = [
    {
      icon: Factory,
      title: "Manufactura & Producción",
      description: "Valoración de empresas manufactureras, plantas de producción y cadenas de montaje con análisis de eficiencia operativa."
    },
    {
      icon: Cog,
      title: "Maquinaria & Equipos",
      description: "Expertise en fabricantes de maquinaria industrial, equipos especializados y soluciones de automatización."
    },
    {
      icon: Truck,
      title: "Logística & Distribución",
      description: "Especialistas en empresas de transporte, almacenamiento y gestión de cadena de suministro."
    },
    {
      icon: Zap,
      title: "Energía & Utilities",
      description: "Valoración de empresas energéticas, utilities, renovables y proyectos de infraestructura energética."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <SectorHero
          sector="Industrial"
          title="Especialistas en Valoración del Sector Industrial"
          description="Profundo conocimiento del sector industrial con expertise en análisis de activos físicos, eficiencia operativa y cadenas de valor. Aplicamos metodologías específicas para empresas manufactureras y de infraestructura."
          primaryButtonText="Valoración Industrial"
          secondaryButtonText="Casos Industriales"
          gradientFrom="from-slate-700"
          gradientTo="to-gray-600"
        />
        
        <SectorStats stats={stats} />
        
        {/* Expertise Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Nuestra Experiencia Industrial
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cobertura completa de todos los subsectores industriales
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {expertise.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Asset Valuation Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Valoración de Activos Industriales
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Expertise especializado en activos físicos y operaciones complejas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Factory className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Plantas & Instalaciones</h3>
                <p className="text-gray-600">Valoración técnica de plantas industriales, maquinaria especializada y equipos de producción.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cog className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Tecnología & I+D</h3>
                <p className="text-gray-600">Evaluación de patentes industriales, procesos propietarios y desarrollos tecnológicos.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Cadena de Suministro</h3>
                <p className="text-gray-600">Análisis de eficiencia logística, contratos de suministro y optimización operativa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-slate-700 to-gray-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Tu empresa industrial necesita valoración?
            </h2>
            <p className="text-xl text-slate-200 mb-8">
              Expertos en valoración industrial con conocimiento técnico especializado
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Consulta Especializada
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-slate-700 transition-colors">
                Casos Industriales
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Industrial;