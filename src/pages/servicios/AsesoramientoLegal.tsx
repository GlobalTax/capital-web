import React, { useEffect } from 'react';
import { HomeLayout } from '@/shared';
import SectorHero from '@/components/SectorHero';
import { Scale, FileCheck, Users, Shield } from 'lucide-react';

const AsesoramientoLegal = () => {
  useEffect(() => {
    document.title = 'Asesoramiento Legal Especializado M&A | Capittal';
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Servicios legales especializados en operaciones corporativas, fusiones y adquisiciones. Nuestro equipo de abogados expertos te acompañará en todo el proceso legal de tu transacción.');
  }, []);

  return (
    <HomeLayout>
      <SectorHero
        sector="Asesoramiento Legal"
        title="Asesoramiento Legal Especializado M&A"
        description="Servicios legales especializados en operaciones corporativas, fusiones y adquisiciones. Nuestro equipo de abogados expertos te acompañará en todo el proceso legal de tu transacción."
        primaryButtonText="Consulta Legal"
        secondaryButtonText="Ver Servicios"
      />
      
      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Servicios Legales Especializados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cobertura legal completa para operaciones corporativas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Scale,
                title: "Due Diligence Legal",
                description: "Revisión exhaustiva de aspectos legales, contratos y contingencias de la empresa objetivo."
              },
              {
                icon: FileCheck,
                title: "Documentación M&A",
                description: "Preparación y revisión de toda la documentación legal necesaria para la transacción."
              },
              {
                icon: Users,
                title: "Derecho Societario",
                description: "Asesoramiento en estructuras societarias, juntas de accionistas y gobierno corporativo."
              },
              {
                icon: Shield,
                title: "Compliance Regulatorio",
                description: "Asegurar el cumplimiento de toda la normativa aplicable durante la operación."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-300 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Necesitas asesoramiento legal especializado?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Nuestros abogados expertos en M&A te acompañarán en todo el proceso
          </p>
          <button className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            Consulta Legal Gratuita
          </button>
        </div>
      </section>
    </HomeLayout>
  );
};

export default AsesoramientoLegal;