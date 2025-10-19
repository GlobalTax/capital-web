import React from 'react';
import { Check, X, TrendingUp, Loader2 } from 'lucide-react';
import { useComparisons } from '@/hooks/useVentaEmpresasContent';

const VentaEmpresasComparison = () => {
  const { data: comparisonData, isLoading } = useComparisons();

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!comparisonData || comparisonData.length === 0) {
    return null;
  }
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <TrendingUp className="h-4 w-4" />
            Comparativa Objetiva
          </div>
          <h2 className="text-4xl font-bold mb-4 text-slate-900">
            Vender Con Capittal vs Por Tu Cuenta
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            La diferencia entre una operación exitosa y una oportunidad perdida
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="bg-slate-50 px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Aspecto
                    </th>
                    <th className="bg-slate-900 px-6 py-4 text-center text-sm font-semibold text-white">
                      ✓ Con Capittal
                    </th>
                    <th className="bg-slate-700 px-6 py-4 text-center text-sm font-semibold text-white">
                      ✗ Por Tu Cuenta
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item, index) => (
                    <tr 
                      key={item.id}
                      className={`
                        border-b border-slate-100 last:border-0
                        ${index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}
                        ${item.is_critical ? 'bg-red-50/30' : ''}
                        hover:bg-slate-50 transition-colors
                      `}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          {item.is_critical && <span className="text-red-500 text-base">★</span>}
                          {item.aspect}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700 leading-relaxed">
                            {item.with_capittal}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600 leading-relaxed">
                            {item.without_capittal}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-1 border border-slate-200 rounded-xl overflow-hidden">
            {comparisonData.map((item, index) => (
              <div 
                key={item.id}
                className={`
                  border-b border-slate-100 last:border-0
                  ${index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}
                `}
              >
                <div className="px-4 py-3 font-semibold text-sm text-slate-900 border-b border-slate-100">
                  {item.is_critical && <span className="text-red-500 mr-1">★</span>}
                  {item.aspect}
                </div>
                
                <div className="px-4 py-3 space-y-3">
                  <div className="flex gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1">Con Capittal</div>
                      <div className="text-sm text-slate-600">{item.with_capittal}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">Por Tu Cuenta</div>
                      <div className="text-sm text-slate-500">{item.without_capittal}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl px-6 py-5">
            <p className="text-xs text-slate-500 mb-3 flex items-center justify-center gap-2">
              <span className="text-red-500">★</span>
              Aspectos críticos que afectan directamente el resultado final
            </p>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900 mb-1">
                En promedio, nuestros clientes obtienen un <span className="text-green-600">32% más</span>
              </p>
              <p className="text-sm text-slate-600">
                El coste de nuestros servicios se compensa con creces con el mejor precio obtenido
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasComparison;
