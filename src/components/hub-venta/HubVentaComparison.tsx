import React from 'react';
import { Check, X, Minus } from 'lucide-react';

const comparisonData = [
  {
    aspect: 'Valoración profesional',
    capittal: { value: '3 métodos', status: 'full' },
    sinAsesor: { value: 'Estimación propia', status: 'none' },
    brokerGeneral: { value: 'Básica', status: 'partial' },
  },
  {
    aspect: 'Red de compradores',
    capittal: { value: '+500 inversores', status: 'full' },
    sinAsesor: { value: 'Conocidos', status: 'none' },
    brokerGeneral: { value: 'Base genérica', status: 'partial' },
  },
  {
    aspect: 'Confidencialidad',
    capittal: { value: 'NDA + proceso anónimo', status: 'full' },
    sinAsesor: { value: 'Baja', status: 'none' },
    brokerGeneral: { value: 'Media', status: 'partial' },
  },
  {
    aspect: 'Tiempo medio',
    capittal: { value: '6-9 meses', status: 'full' },
    sinAsesor: { value: '12-24 meses', status: 'none' },
    brokerGeneral: { value: '9-15 meses', status: 'partial' },
  },
  {
    aspect: 'Precio obtenido',
    capittal: { value: '+15-30% vs media', status: 'full' },
    sinAsesor: { value: 'Variable', status: 'none' },
    brokerGeneral: { value: '+5-10%', status: 'partial' },
  },
  {
    aspect: 'Especialización M&A',
    capittal: { value: 'Exclusiva', status: 'full' },
    sinAsesor: { value: 'Ninguna', status: 'none' },
    brokerGeneral: { value: 'Parcial', status: 'partial' },
  },
];

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'full') {
    return <Check className="h-4 w-4 text-green-600" />;
  }
  if (status === 'partial') {
    return <Minus className="h-4 w-4 text-amber-500" />;
  }
  return <X className="h-4 w-4 text-red-500" />;
};

const HubVentaComparison: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs font-light uppercase tracking-widest text-slate-500 mb-4">
            Compara opciones
          </p>
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-4">
            ¿Por Qué Elegir Capittal?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Vender una empresa es una decisión importante. Compara las opciones disponibles.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-slate-50 font-medium text-slate-600 rounded-tl-xl">
                  Aspecto
                </th>
                <th className="p-4 bg-slate-900 text-white font-medium text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-lg">Con Capittal</span>
                    <span className="text-xs text-slate-300 font-normal">Recomendado</span>
                  </div>
                </th>
                <th className="p-4 bg-slate-100 font-medium text-slate-600 text-center">
                  Sin Asesor
                </th>
                <th className="p-4 bg-slate-100 font-medium text-slate-600 text-center rounded-tr-xl">
                  Broker Generalista
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr 
                  key={index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                >
                  <td className="p-4 text-slate-700 font-medium border-b border-slate-100">
                    {row.aspect}
                  </td>
                  <td className="p-4 text-center border-b border-slate-100 bg-green-50/50">
                    <div className="flex items-center justify-center gap-2">
                      <StatusIcon status={row.capittal.status} />
                      <span className="text-sm font-medium text-slate-800">{row.capittal.value}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center border-b border-slate-100">
                    <div className="flex items-center justify-center gap-2">
                      <StatusIcon status={row.sinAsesor.status} />
                      <span className="text-sm text-slate-600">{row.sinAsesor.value}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center border-b border-slate-100">
                    <div className="flex items-center justify-center gap-2">
                      <StatusIcon status={row.brokerGeneral.status} />
                      <span className="text-sm text-slate-600">{row.brokerGeneral.value}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={() => document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
          >
            Solicitar Valoración Gratuita
          </button>
        </div>
      </div>
    </section>
  );
};

export default HubVentaComparison;
