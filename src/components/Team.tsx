
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Team = () => {
  const teamMembers = [
    {
      name: 'Carlos Martínez',
      position: 'Managing Partner',
      experience: '20+ años en M&A',
      background: 'Ex-Goldman Sachs, MBA IESE',
      image: '/lovable-uploads/5459d292-9157-404f-915b-a1608e1f4779.png',
    },
    {
      name: 'Ana Rodriguez',
      position: 'Partner',
      experience: '15+ años en Corporate Finance',
      background: 'Ex-JP Morgan, CFA',
      image: '/lovable-uploads/b3d6115b-5184-49d6-8c1d-3493d1d72ca7.png',
    },
    {
      name: 'Miguel Santos',
      position: 'Senior Director',
      experience: '12+ años en Due Diligence',
      background: 'Ex-McKinsey, MBA Wharton',
      image: '/lovable-uploads/3aeb6303-e888-4dde-846f-88ec5c6606ae.png',
    },
    {
      name: 'David López',
      position: 'Director',
      experience: '10+ años en Valoraciones',
      background: 'Ex-Deloitte, CPA',
      image: '/lovable-uploads/8c3bfca2-1cf0-42a1-935b-61cf6c319ecb.png',
    },
    {
      name: 'Roberto García',
      position: 'Senior Associate',
      experience: '8+ años en Análisis Financiero',
      background: 'Ex-KPMG, Master Finance',
      image: '/lovable-uploads/20da2e90-43c8-4c44-a119-a68b49bf41c0.png',
    },
    {
      name: 'Antonio Navarro',
      position: 'Managing Director',
      experience: '25+ años en Investment Banking',
      background: 'Ex-Morgan Stanley, MBA Harvard',
      image: '/lovable-uploads/dfc75c41-289d-4bfd-963f-7838a1a06225.png',
    },
  ];

  return (
    <section id="equipo" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Nuestro Equipo
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Profesionales con trayectorias excepcionales en las principales firmas 
            de inversión y consultoría del mundo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="capittal-card text-center">
              <CardContent className="p-6">
                <div className="w-32 h-32 mx-auto mb-6 overflow-hidden rounded-lg border-0.5 border-black">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                
                <h3 className="text-lg font-semibold text-black mb-2">
                  {member.name}
                </h3>
                
                <p className="text-base font-medium text-gray-700 mb-2">
                  {member.position}
                </p>
                
                <p className="text-gray-600 mb-2 text-sm">
                  {member.experience}
                </p>
                
                <p className="text-xs text-gray-500">
                  {member.background}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-black mb-4">Experiencia</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Décadas de experiencia combinada en las transacciones más complejas del mercado.
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-black mb-4">Integridad</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Compromiso absoluto con la confidencialidad y los más altos estándares éticos.
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-black mb-4">Resultados</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Enfoque obsesivo en la ejecución exitosa y la creación de valor para nuestros clientes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
