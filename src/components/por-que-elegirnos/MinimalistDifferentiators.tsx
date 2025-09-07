import React from 'react';

const MinimalistDifferentiators = () => {
const differentiators = [
    {
      title: "Especialistas en pyme y empresa familiar",
      description: "Entendemos sucesión, protocolo familiar y la importancia de la continuidad del legado.",
      metric: "Continuidad"
    },
    {
      title: "Ultraespecialización por sector y territorio",
      description: "Foco en alimentación y distribución, logística/comercial y protección contra incendios, con cobertura de Cataluña y Baleares (M&A de proximidad) y capacidad nacional.",
      metric: "3 sectores clave"
    },
    {
      title: "Valoración y preparación que aguantan la due diligence",
      description: "Documentación financiera, fiscal y legal lista para auditoría, reduciendo sorpresas en el cierre.",
      metric: "Due diligence ready"
    },
    {
      title: "Plataforma tecnológica propia",
      description: "CRM y dataroom seguros, trazabilidad del pipeline y reporting transparente para el mandante.",
      metric: "Tech propia"
    },
    {
      title: "Alineación de incentivos",
      description: "Honorarios claros y componente de éxito: ganamos cuando tú ganas.",
      metric: "Éxito compartido"
    },
    {
      title: "Acceso a compradores e inversores",
      description: "Red activa de estratégicos y financial sponsors, con alcance paneuropeo.",
      metric: "Red paneuropea"
    },
    {
      title: "Ejecución 360º",
      description: "Teaser, cuaderno de venta, contacto cualificado, gestión de NDAs, coordinación de ofertas, SPA y cierre.",
      metric: "Proceso completo"
    },
    {
      title: "Cumplimiento y confidencialidad",
      description: "Procesos y NDAs estandarizados, cumplimiento RGPD y criterio profesional.",
      metric: "Máxima seguridad"
    },
    {
      title: "Transparencia y reportes",
      description: "Indicadores clave, hitos y siguientes pasos, visibles en panel de seguimiento.",
      metric: "Full visibility"
    },
    {
      title: "Equipo multidisciplinar",
      description: "Abogados, fiscalistas y analistas financieros trabajando como un solo equipo.",
      metric: "360º expertise"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-6">
            Nuestras Ventajas Competitivas
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Lo Que Nos Diferencia
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            No somos una consultora generalista. Somos especialistas en M&A que vivimos 
            y respiramos compraventa de empresas todos los días.
          </p>
        </div>

        {/* Differentiators grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {differentiators.map((item, index) => (
            <div 
              key={index} 
              className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group"
            >
              {/* Highlight metric */}
              <div className="flex items-center justify-between mb-6">
                <div className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold border-0.5 border-border">
                  {item.metric}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-black mb-4">
                {item.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MinimalistDifferentiators;