import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorStats from '@/components/sector/SectorStats';
import { TrendingUp, Shield, CreditCard, PiggyBank } from 'lucide-react';

const FinancialServices = () => {
  const stats = [
    { number: "25%", label: "ROE promedio sector" },
    { number: "1.2x", label: "Múltiplo Precio/Valor Libros" },
    { number: "120+", label: "Entidades valoradas" },
    { number: "100%", label: "Cumplimiento regulatorio" }
  ];

  const expertise = [
    {
      icon: TrendingUp,
      title: "Banca & Inversión",
      description: "Valoración de entidades bancarias, gestoras de fondos y servicios de inversión con metodologías específicas del sector."
    },
    {
      icon: Shield,
      title: "Seguros & Reaseguros",
      description: "Expertise en compañías aseguradoras, correduría y reaseguros con análisis actuarial y de reservas técnicas."
    },
    {
      icon: CreditCard,
      title: "Fintech & Pagos",
      description: "Especialistas en startups financieras, medios de pago digitales y tecnologías de servicios financieros."
    },
    {
      icon: PiggyBank,
      title: "Gestión de Activos",
      description: "Valoración de gestoras, fondos de inversión, family offices y servicios de wealth management."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <SectorHero
          sector="Servicios Financieros"
          title="Expertos en Valoración de Entidades Financieras"
          description="Especialización en el sector financiero con profundo conocimiento regulatorio. Aplicamos metodologías específicas como múltiplos de patrimonio, análisis de márgenes y evaluación de carteras."
          primaryButtonText="Valoración Financiera"
          secondaryButtonText="Casos Financieros"
          gradientFrom="from-amber-600"
          gradientTo="to-orange-600"
        />
        
        <SectorStats stats={stats} />
        
        {/* Expertise Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Especialización Financiera
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cobertura integral de todos los subsectores financieros
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {expertise.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Methodologies Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Metodologías Especializadas
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Métodos de valoración específicos para entidades financieras
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">P/B</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Precio/Valor Libros</h3>
                <p className="text-gray-600">Múltiplos específicos del sector financiero basados en valor patrimonial y ROE.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">DDM</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Modelo de Dividendos</h3>
                <p className="text-gray-600">Valoración basada en capacidad de generación y distribución de dividendos.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">SUM</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Suma de Partes</h3>
                <p className="text-gray-600">Valoración separada de líneas de negocio y subsidiarias para grupos financieros.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Necesitas valorar tu entidad financiera?
            </h2>
            <p className="text-xl text-amber-100 mb-8">
              Expertos en servicios financieros con conocimiento regulatorio especializado
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Consulta Especializada
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-amber-600 transition-colors">
                Casos Financieros
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default FinancialServices;