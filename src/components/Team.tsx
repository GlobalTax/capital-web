
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Team = () => {
  const teamMembers = [
    {
      name: 'Carlos Martínez',
      position: 'Managing Partner',
      experience: '20+ años en M&A',
      background: 'Ex-Goldman Sachs, MBA IESE',
      image: '/api/placeholder/300/400',
    },
    {
      name: 'Ana Rodriguez',
      position: 'Partner',
      experience: '15+ años en Corporate Finance',
      background: 'Ex-JP Morgan, CFA',
      image: '/api/placeholder/300/400',
    },
    {
      name: 'Miguel Santos',
      position: 'Senior Director',
      experience: '12+ años en Due Diligence',
      background: 'Ex-McKinsey, MBA Wharton',
      image: '/api/placeholder/300/400',
    },
  ];

  return (
    <section id="equipo" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Nuestro Equipo
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Profesionales con trayectorias excepcionales en las principales firmas 
            de inversión y consultoría del mundo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="capittal-card group text-center">
              <CardContent className="p-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 border-0.5 border-black"></div>
                
                <h3 className="text-xl font-semibold text-black mb-2">
                  {member.name}
                </h3>
                
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {member.position}
                </p>
                
                <p className="text-gray-600 mb-2">
                  {member.experience}
                </p>
                
                <p className="text-sm text-gray-500">
                  {member.background}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Values */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-black mb-4">Experiencia</h3>
            <p className="text-gray-600">
              Décadas de experiencia combinada en las transacciones más complejas del mercado.
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-black mb-4">Integridad</h3>
            <p className="text-gray-600">
              Compromiso absoluto con la confidencialidad y los más altos estándares éticos.
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-black mb-4">Resultados</h3>
            <p className="text-gray-600">
              Enfoque obsesivo en la ejecución exitosa y la creación de valor para nuestros clientes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
