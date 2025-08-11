import React from 'react';

const CapittalBrief: React.FC = () => {
  return (
    <section aria-labelledby="about-capittal" className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="max-w-3xl">
          <h2 id="about-capittal" className="text-2xl font-semibold text-gray-900">
            ¿Qué es Capittal?
          </h2>
          <p className="mt-3 text-gray-700">
            Capittal es una firma boutique de M&A que acompaña procesos de compra y venta de empresas en España.
            Trabajamos con pymes y mid-market, especialmente en sectores B2B, industrial y tecnología.
          </p>
        </header>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Experiencia</p>
            <p className="mt-1 font-medium text-gray-900">+250 valoraciones realizadas</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Cobertura</p>
            <p className="mt-1 font-medium text-gray-900">Operaciones en toda España</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Especialización</p>
            <p className="mt-1 font-medium text-gray-900">B2B, industrial y tecnología</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CapittalBrief;
