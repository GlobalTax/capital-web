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
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6">
            Múltiplos Sectoriales de Valoración
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Datos actualizados de múltiplos EV/EBITDA por sector basados en transacciones reales 
            y empresas cotizadas comparables.
          </p>
        </div>

        {/* Múltiplos Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-slate-200 animate-pulse">
                <div className="h-8 w-8 bg-slate-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-6 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {multiples.slice(0, 8).map((multiple, index) => {
              const Icon = getIcon(multiple.sector_name);
              const medianValue = parseFloat(multiple.median_multiple.replace(/[^\d.]/g, '')) || 0;
              
              return (
                <div key={multiple.id} className="bg-white rounded-lg p-4 border border-slate-200 hover:border-primary transition-colors group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="text-xs text-slate-500">#{index + 1}</span>
                  </div>
                  
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    {multiple.sector_name}
                  </h3>
                  
                  <div className="text-xl font-semibold text-primary mb-2">
                    {medianValue.toFixed(1)}x
                  </div>
                  
                  <div className="text-xs text-slate-600 mb-2">
                    Rango: {multiple.multiple_range}
                  </div>
                  
                  {multiple.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {multiple.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Explicación de Factores */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              ¿Qué Factores Influyen en los Múltiplos?
            </h3>
            
            <div className="space-y-4">
              {factoresInfluencia.map((factor, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {factor.titulo}
                    </h4>
                    <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                      {factor.impacto}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {factor.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-slate-600 mr-3" />
              <h3 className="text-xl font-semibold text-slate-900">
                Tendencias del Mercado
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Múltiplos en Alza</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                    Tecnología +12%
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                    Salud +8%
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                    Energías Renovables +15%
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Estables</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded text-xs">
                    Industrial 0%
                  </span>
                  <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded text-xs">
                    Servicios +2%
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900 mb-2">En Corrección</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                    Retail -5%
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                    Hostelería -3%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600">
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