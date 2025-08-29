import React from 'react';
import { useValuationMultiples } from '@/hooks/useValuationMultiples';
import { TrendingUp, Building, Building2, Zap, HeartHandshake, Car, Utensils, Shirt } from 'lucide-react';

const ValoracionesMultiples = () => {
  const { multiples, isLoading } = useValuationMultiples();

  const sectorIcons = {
    'Tecnología': Zap,
    'Salud': HeartHandshake,
    'Industrial': Building2,
    'Automoción': Car,
    'Hostelería': Utensils,
    'Retail': Shirt,
    'Construcción': Building2,
    'Servicios': Building
  };

  const getIcon = (sectorName: string) => {
    const key = Object.keys(sectorIcons).find(k => 
      sectorName.toLowerCase().includes(k.toLowerCase())
    );
    return key ? sectorIcons[key as keyof typeof sectorIcons] : Building;
  };

  const factoresInfluencia = [
    {
      titulo: 'Crecimiento del Sector',
      descripcion: 'Sectores en crecimiento obtienen múltiplos más altos',
      impacto: '+15% a +40%'
    },
    {
      titulo: 'Rentabilidad (EBITDA Margin)',
      descripcion: 'Márgenes superiores al 20% incrementan la valoración',
      impacto: '+10% a +25%'
    },
    {
      titulo: 'Tamaño de la Empresa',
      descripcion: 'Empresas más grandes tienen mayor liquidez',
      impacto: '+5% a +15%'
    },
    {
      titulo: 'Diversificación de Clientes',
      descripcion: 'Menor dependencia de clientes clave reduce riesgo',
      impacto: '+8% a +20%'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Múltiplos Sectoriales de Valoración
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Datos actualizados de múltiplos EV/EBITDA por sector basados en transacciones reales 
            y empresas cotizadas comparables.
          </p>
        </div>

        {/* Múltiplos Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-md animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {multiples.slice(0, 8).map((multiple, index) => {
              const Icon = getIcon(multiple.sector_name);
              const medianValue = parseFloat(multiple.median_multiple.replace(/[^\d.]/g, '')) || 0;
              
              return (
                <div key={multiple.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-black mb-2">
                    {multiple.sector_name}
                  </h3>
                  
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {medianValue.toFixed(1)}x
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Rango: {multiple.multiple_range}
                  </div>
                  
                  {multiple.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {multiple.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Explicación de Factores */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-2xl font-bold text-black mb-8">
              ¿Qué Factores Influyen en los Múltiplos?
            </h3>
            
            <div className="space-y-6">
              {factoresInfluencia.map((factor, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-black">
                      {factor.titulo}
                    </h4>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {factor.impacto}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {factor.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-black">
                Tendencias del Mercado
              </h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-black mb-2">Múltiplos en Alza</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Tecnología +12%
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Salud +8%
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Energías Renovables +15%
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-black mb-2">Estables</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    Industrial 0%
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    Servicios +2%
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-black mb-2">En Corrección</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Retail -5%
                  </span>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Hostelería -3%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los múltiplos pueden variar significativamente según 
                el tamaño de la empresa, rentabilidad, crecimiento y factores específicos del negocio.
                Para una valoración precisa, recomendamos un análisis detallado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesMultiples;