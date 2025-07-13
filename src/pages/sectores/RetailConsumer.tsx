import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorStats from '@/components/sector/SectorStats';
import { ShoppingBag, Store, Users, TrendingUp } from 'lucide-react';

const RetailConsumer = () => {
  const stats = [
    { number: "35%", label: "Crecimiento e-commerce anual" },
    { number: "6.8x", label: "Múltiplo EBITDA promedio" },
    { number: "180+", label: "Retailers valorados" },
    { number: "89%", label: "Precisión en proyecciones" }
  ];

  const expertise = [
    {
      icon: ShoppingBag,
      title: "E-commerce & Retail Digital",
      description: "Valoración de plataformas digitales, marketplaces y empresas de comercio electrónico con modelos omnicanal."
    },
    {
      icon: Store,
      title: "Retail Tradicional",
      description: "Expertise en cadenas de tiendas, centros comerciales y formatos retail con análisis de ubicaciones y tráfico."
    },
    {
      icon: Users,
      title: "Marcas de Consumo",
      description: "Especialistas en valoración de marcas, productos de gran consumo y empresas de bienes de consumo duradero."
    },
    {
      icon: TrendingUp,
      title: "Distribución & Wholesale",
      description: "Valoración de distribuidoras, mayoristas y empresas de la cadena de suministro retail."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <SectorHero
          sector="Retail & Consumer"
          title="Expertos en Valoración del Sector Retail"
          description="Especialización en retail y bienes de consumo con profundo conocimiento de tendencias digitales. Analizamos métricas específicas como same-store sales, customer lifetime value y eficiencia por canal."
          primaryButtonText="Valoración Retail"
          secondaryButtonText="Casos Retail"
          gradientFrom="from-pink-600"
          gradientTo="to-rose-600"
        />
        
        <SectorStats stats={stats} />
        
        {/* Expertise Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Nuestra Experiencia Retail
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cobertura completa del ecosistema retail y consumo
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {expertise.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Retail Metrics Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Métricas Especializadas Retail
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                KPIs específicos que utilizamos en nuestras valoraciones
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-sm">SSS</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Same-Store Sales</h3>
                <p className="text-gray-600">Análisis de crecimiento orgánico y performance por tienda para valoraciones precisas.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-sm">LTV</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Customer Lifetime Value</h3>
                <p className="text-gray-600">Valoración basada en valor de vida del cliente y análisis de cohortes de consumo.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-sm">CAC</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Customer Acquisition Cost</h3>
                <p className="text-gray-600">Optimización de costes de adquisición y efficiency ratio marketing/ventas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-pink-600 to-rose-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Tu empresa retail necesita valoración?
            </h2>
            <p className="text-xl text-pink-100 mb-8">
              Expertos en retail con conocimiento de tendencias digitales y consumer behavior
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Consulta Especializada
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-pink-600 transition-colors">
                Casos Retail
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default RetailConsumer;