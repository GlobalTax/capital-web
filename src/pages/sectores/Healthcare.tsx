import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectorHero from '@/components/SectorHero';
import SectorStats from '@/components/sector/SectorStats';
import { Heart, Shield, Microscope, Activity } from 'lucide-react';

const Healthcare = () => {
  const stats = [
    { number: "45%", label: "Crecimiento del sector en 5 años" },
    { number: "8.5x", label: "Múltiplo EBITDA promedio" },
    { number: "80+", label: "Transacciones en salud" },
    { number: "98%", label: "Cumplimiento regulatorio" }
  ];

  const expertise = [
    {
      icon: Heart,
      title: "Servicios Sanitarios",
      description: "Valoración de clínicas, hospitales privados y centros especializados con enfoque en flujos de pacientes y rentabilidad."
    },
    {
      icon: Shield,
      title: "Farmacéutica & Biotech",
      description: "Experiencia en valoración de empresas farmacéuticas, desarrollo de medicamentos y tecnologías médicas innovadoras."
    },
    {
      icon: Microscope,
      title: "Dispositivos Médicos",
      description: "Especialistas en empresas de equipamiento médico, diagnóstico y tecnologías sanitarias avanzadas."
    },
    {
      icon: Activity,
      title: "HealthTech & Telemedicina",
      description: "Valoración de plataformas digitales de salud, aplicaciones médicas y servicios de telemedicina."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <SectorHero
          sector="Healthcare"
          title="Especialistas en Valoración del Sector Salud"
          description="Profundo conocimiento del sector sanitario y farmacéutico. Entendemos las complejidades regulatorias, ciclos de desarrollo y métricas específicas que caracterizan a las empresas de salud."
          primaryButtonText="Valoración Healthcare"
          secondaryButtonText="Casos Sanitarios"
          gradientFrom="from-emerald-600"
          gradientTo="to-teal-600"
        />
        
        <SectorStats stats={stats} />
        
        {/* Expertise Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Nuestra Experiencia en Salud
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cobertura completa de todos los subsectores sanitarios
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {expertise.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Regulatory Compliance Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Cumplimiento Regulatorio
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Expertise en normativas sanitarias y farmacéuticas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-emerald-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-black mb-3">Normativa Europea</h3>
                <p className="text-gray-600">Conocimiento profundo de regulaciones EMA, CE marking y directivas de dispositivos médicos.</p>
              </div>
              
              <div className="bg-emerald-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-black mb-3">AEMPS & Sanidad</h3>
                <p className="text-gray-600">Experiencia con autorizaciones sanitarias españolas y procesos de registro de medicamentos.</p>
              </div>
              
              <div className="bg-emerald-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-black mb-3">Protección de Datos</h3>
                <p className="text-gray-600">Expertise en GDPR aplicado a datos sanitarios y privacidad en salud digital.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Tu empresa del sector salud necesita valoración?
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Expertos en healthcare con conocimiento regulatorio y sectorial
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Consulta Especializada
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors">
                Casos de Éxito Healthcare
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Healthcare;