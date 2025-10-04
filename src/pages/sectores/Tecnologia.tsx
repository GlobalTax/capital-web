import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorStats from '@/components/sector/SectorStats';
import { Computer, TrendingUp, Users, Award } from 'lucide-react';

const Tecnologia = () => {
  const stats = [
    { number: "85%", label: "Crecimiento anual promedio" },
    { number: "5.5x", label: "Múltiplo EBITDA promedio" },
    { number: "150+", label: "Transacciones completadas" },
    { number: "98,7%", label: "Tasa de éxito en deals" }
  ];

  const expertise = [
    {
      icon: Computer,
      title: "Software & SaaS",
      description: "Especialistas en valoración de empresas de software, SaaS y plataformas digitales con modelos de suscripción."
    },
    {
      icon: TrendingUp,
      title: "FinTech & PropTech",
      description: "Experiencia en startups tecnológicas disruptivas en servicios financieros e inmobiliarios."
    },
    {
      icon: Users,
      title: "E-commerce & MarTech",
      description: "Conocimiento profundo en plataformas de comercio electrónico y tecnologías de marketing."
    },
    {
      icon: Award,
      title: "Deep Tech & AI",
      description: "Valoración especializada en inteligencia artificial, blockchain y tecnologías emergentes."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <SectorHero
          sector="Tecnología"
          title="Expertos en Valoración de Empresas Tecnológicas"
          description="Especialistas en la valoración de empresas tecnológicas, desde startups hasta scale-ups. Entendemos las métricas específicas del sector tech y aplicamos metodologías de valoración adaptadas a modelos de negocio digitales."
          primaryButtonText="Solicitar Valoración Tech"
          secondaryButtonText="Casos de Éxito"
          gradientFrom="from-blue-600"
          gradientTo="to-purple-600"
        />
        
        <SectorStats stats={stats} />
        
        {/* Expertise Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Nuestra Especialización Tech
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Profundo conocimiento en todos los subsectores tecnológicos
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {expertise.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-blue-600" />
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
                Aplicamos métodos de valoración específicos para empresas tecnológicas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Múltiplos de Ingresos</h3>
                <p className="text-gray-600">Aplicamos múltiplos específicos de ARR (Annual Recurring Revenue) y MRR (Monthly Recurring Revenue) para modelos SaaS.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Análisis de Cohorts</h3>
                <p className="text-gray-600">Evaluamos la retención de usuarios, LTV (Lifetime Value) y CAC (Customer Acquisition Cost) para proyecciones precisas.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Valoración de Activos Digitales</h3>
                <p className="text-gray-600">Incluimos propiedad intelectual, datos, algoritmos y posicionamiento digital en nuestras valoraciones.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Necesitas valorar tu empresa tecnológica?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Nuestros expertos en tech te ayudarán a obtener una valoración precisa y estratégica
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Consulta
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Descargar Caso de Éxito
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Tecnologia;