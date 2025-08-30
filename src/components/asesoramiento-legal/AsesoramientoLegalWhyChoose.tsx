import React from 'react';
import { Shield, Scale, CheckCircle } from 'lucide-react';

const AsesoramientoLegalWhyChoose = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Máxima Protección Legal",
      description: "Identificamos y mitigamos todos los riesgos legales antes de que se conviertan en problemas costosos para tu operación.",
      highlight: "0% contingencias"
    },
    {
      icon: Scale,
      title: "Estructuración Óptima",
      description: "Diseñamos la estructura contractual más eficiente que protege tus intereses y acelera el proceso de cierre.",
      highlight: "Tiempo reducido"
    },
    {
      icon: CheckCircle,
      title: "Due Diligence Integral",
      description: "Nuestro análisis exhaustivo garantiza que no hay sorpresas ocultas que puedan comprometer el valor de la transacción.",
      highlight: "100% transparencia"
    }
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Por qué Elegir Nuestro Asesoramiento Legal?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            La experiencia legal adecuada puede evitar millones en contingencias 
            y asegurar el éxito de tu operación desde el primer día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white border-0.5 border-black rounded-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out text-center group">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-100 transition-colors duration-300">
                <benefit.icon className="w-8 h-8 text-black" />
              </div>
              
              <h3 className="text-xl font-bold text-black mb-4">
                {benefit.title}
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                {benefit.description}
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg py-2 px-4">
                <span className="text-sm font-bold text-green-800">
                  {benefit.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white border-0.5 border-black rounded-lg p-8 inline-block">
            <p className="text-lg font-semibold text-black mb-2">
              +500 operaciones asesoradas legalmente sin contingencias mayores
            </p>
            <p className="text-slate-600">
              Protegiendo más de €2.5B en valor de transacciones desde 2008
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AsesoramientoLegalWhyChoose;