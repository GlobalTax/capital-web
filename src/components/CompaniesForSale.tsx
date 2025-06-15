
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const CompaniesForSale = () => {
  const companies = [
    {
      sector: 'Tecnología',
      title: 'Software SaaS B2B en fase de crecimiento',
      revenue: '2.5M€',
      ebitda: '600K€',
      location: 'España',
      description: 'Empresa de software SaaS B2B con producto consolidado y base de clientes recurrentes. Crecimiento anual del 30% en los últimos 3 años.',
      category: 'tech'
    },
    {
      sector: 'Industrial',
      title: 'Fabricante de componentes industriales',
      revenue: '8M€',
      ebitda: '1.2M€',
      location: 'España',
      description: 'Fabricante de componentes industriales con 25 años de trayectoria. Cartera de clientes diversificada y presencia internacional.',
      category: 'industrial'
    },
    {
      sector: 'Servicios',
      title: 'Empresa de servicios profesionales',
      revenue: '3.8M€',
      ebitda: '850K€',
      location: 'España',
      description: 'Empresa de servicios profesionales con equipo consolidado y cartera de clientes estable. Oportunidad de expansión geográfica.',
      category: 'services'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Empresas a la Venta
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Oportunidades exclusivas de inversión y adquisición en diferentes sectores
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((company, index) => (
            <Card key={index} className="bg-white border-0.5 border-gray-300 rounded-lg shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 h-full">
              <CardContent className="p-3">
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                    {company.sector}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-black mb-2 leading-tight">
                  {company.title}
                </h3>

                <div className="space-y-1 mb-3">
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block">Facturación:</span>
                      <span className="font-medium text-black">{company.revenue}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">EBITDA:</span>
                      <span className="font-medium text-black">{company.ebitda}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Ubicación:</span>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="font-medium text-black">{company.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {company.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="capittal-button">
            Ver Todas las Oportunidades
          </button>
        </div>
      </div>
    </section>
  );
};

export default CompaniesForSale;
