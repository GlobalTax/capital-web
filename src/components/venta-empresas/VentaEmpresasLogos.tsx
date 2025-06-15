
import React from 'react';

const VentaEmpresasLogos = () => {
  const operaciones = [
    {
      empresa: 'TechVision',
      sector: 'Tecnología',
      valoracion: '€15M',
      ano: '2024',
      descripcion: 'SaaS B2B especializado en análisis de datos',
      destacada: true
    },
    {
      empresa: 'InnovateLab',
      sector: 'I+D',
      valoracion: '€8M',
      ano: '2024',
      descripcion: 'Laboratorio de innovación tecnológica',
      destacada: false
    },
    {
      empresa: 'DataFlow Solutions',
      sector: 'Software',
      valoracion: '€22M',
      ano: '2023',
      descripcion: 'Plataforma de gestión de datos empresariales',
      destacada: true
    },
    {
      empresa: 'GreenEnergy Corp',
      sector: 'Energía',
      valoracion: '€35M',
      ano: '2023',
      descripcion: 'Desarrollo de soluciones energéticas sostenibles',
      destacada: true
    },
    {
      empresa: 'HealthTech Pro',
      sector: 'Salud',
      valoracion: '€18M',
      ano: '2023',
      descripcion: 'Tecnología médica y telemedicina',
      destacada: false
    },
    {
      empresa: 'AutoParts Plus',
      sector: 'Automoción',
      valoracion: '€12M',
      ano: '2022',
      descripcion: 'Distribución de componentes automotrices',
      destacada: false
    },
    {
      empresa: 'FoodChain Connect',
      sector: 'Alimentación',
      valoracion: '€28M',
      ano: '2022',
      descripcion: 'Plataforma de trazabilidad alimentaria',
      destacada: true
    },
    {
      empresa: 'RetailMax',
      sector: 'Retail',
      valoracion: '€9M',
      ano: '2022',
      descripcion: 'Cadena de tiendas especializadas',
      destacada: false
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-black mb-6">
            Operaciones Realizadas
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Estas son algunas de las empresas que hemos ayudado a vender exitosamente 
            en los últimos años, obteniendo los mejores resultados para nuestros clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {operaciones.map((operacion, index) => (
            <div key={index} className={`capittal-card text-center group ${operacion.destacada ? 'ring-2 ring-black' : ''}`}>
              {/* Logo placeholder */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg h-20 flex items-center justify-center mb-6 group-hover:bg-gray-50 transition-colors duration-300">
                <span className="text-gray-500 font-bold text-lg">
                  {operacion.empresa.split(' ').map(word => word[0]).join('')}
                </span>
              </div>
              
              <h3 className="text-base font-bold text-black mb-2">
                {operacion.empresa}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {operacion.descripcion}
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Sector:</span>
                  <span className="font-medium text-black">{operacion.sector}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Valoración:</span>
                  <span className="font-bold text-green-600">{operacion.valoracion}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Año:</span>
                  <span className="font-medium text-black">{operacion.ano}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="capittal-card max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-black mb-2">200+</div>
              <div className="text-gray-600">Operaciones</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black mb-2">€2.5B</div>
              <div className="text-gray-600">Valor Total</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black mb-2">15</div>
              <div className="text-gray-600">Años Experiencia</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black mb-2">85%</div>
              <div className="text-gray-600">Tasa Éxito</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasLogos;
