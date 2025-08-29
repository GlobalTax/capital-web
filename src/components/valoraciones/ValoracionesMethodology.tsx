
import React from 'react';
import { BarChart3, TrendingUp, Calculator, Award, Target, Zap, FileCheck, PieChart } from 'lucide-react';

const ValoracionesMethodology = () => {
  const metodologias = [
    {
      icon: TrendingUp,
      titulo: 'Flujos de Caja Descontados (DCF)',
      descripcion: 'Valoración basada en proyecciones financieras detalladas y capacidad de generación de caja futura.',
      precision: '±8-12%',
      aplicacion: 'Empresas estables con historial predictible',
      ventajas: ['Valor intrínseco real', 'Considera crecimiento futuro', 'Ajustable a riesgo específico'],
      limitaciones: ['Sensible a proyecciones', 'Requiere datos históricos', 'Complejo en sectores volátiles']
    },
    {
      icon: BarChart3,
      titulo: 'Múltiplos Comparables',
      descripcion: 'Análisis mediante múltiplos de empresas cotizadas similares y transacciones precedentes del sector.',
      precision: '±10-15%',
      aplicacion: 'Sectores con empresas comparables suficientes',
      ventajas: ['Refleja condiciones de mercado', 'Rápido de aplicar', 'Basado en datos reales'],
      limitaciones: ['Requiere comparables', 'Influenciado por sentiment', 'Menos personalizado']
    },
    {
      icon: Calculator,
      titulo: 'Valor Patrimonial Ajustado',
      descripcion: 'Valoración de activos tangibles e intangibles ajustados a valor razonable de mercado.',
      precision: '±5-10%',
      aplicacion: 'Empresas holding o con activos significativos',
      ventajas: ['Base sólida de activos', 'Menor volatilidad', 'Útil en distress'],
      limitaciones: ['No considera goodwill operativo', 'Subestima empresas de servicios', 'Requiere tasaciones']
    },
    {
      icon: Award,
      titulo: 'Síntesis Multimetodológica',
      descripcion: 'Combinación ponderada de todas las metodologías para obtener un rango de valoración robusto.',
      precision: '±5-8%',
      aplicacion: 'Valoraciones profesionales y operaciones M&A',
      ventajas: ['Máxima precisión', 'Reduce sesgos metodológicos', 'Rango de confianza'],
      limitaciones: ['Más compleja', 'Requiere experiencia', 'Mayor tiempo de análisis']
    }
  ];

  const factoresClave = [
    {
      icon: Target,
      titulo: 'Calidad de los Ingresos',
      descripcion: 'Recurrencia, visibilidad y diversificación de la base de ingresos',
      impacto: '+/-15-25%'
    },
    {
      icon: Zap,
      titulo: 'Ventaja Competitiva',
      descripcion: 'Barreras de entrada, diferenciación y posicionamiento en el mercado',
      impacto: '+/-10-20%'
    },
    {
      icon: FileCheck,
      titulo: 'Calidad del Management',
      descripcion: 'Experiencia del equipo directivo y sistemas de gobierno corporativo',
      impacto: '+/-8-15%'
    },
    {
      icon: PieChart,
      titulo: 'Diversificación',
      descripcion: 'Concentración de clientes, productos y mercados geográficos',
      impacto: '+/-10-18%'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Metodologías de Valoración Profesional
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Aplicamos las técnicas más reconocidas internacionalmente, 
            utilizadas por las principales firmas de investment banking y consultoras estratégicas.
          </p>
        </div>

        {/* Metodologías principales */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {metodologias.map((metodologia, index) => {
            const Icon = metodologia.icon;
            return (
              <div key={index} className="group">
                <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-black group-hover:text-blue-600 transition-colors duration-300">
                          {metodologia.titulo}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {metodologia.precision}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {metodologia.descripcion}
                      </p>
                      <div className="text-sm text-blue-600 font-medium mb-4">
                        Aplicación: {metodologia.aplicacion}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-2">Ventajas</h4>
                      <ul className="space-y-1">
                        {metodologia.ventajas.map((ventaja, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <span className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {ventaja}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-orange-700 mb-2">Limitaciones</h4>
                      <ul className="space-y-1">
                        {metodologia.limitaciones.map((limitacion, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <span className="w-1 h-1 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {limitacion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Factores que influyen en la valoración */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-black mb-4">
              Factores Clave que Influyen en la Valoración
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Más allá de las métricas financieras, estos factores cualitativos pueden 
              impactar significativamente en la valoración final
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {factoresClave.map((factor, index) => {
              const Icon = factor.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-black mb-2">
                    {factor.titulo}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {factor.descripcion}
                  </p>
                  <span className="text-sm font-semibold text-blue-600">
                    Impacto: {factor.impacto}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-black mb-4">
              ¿Por qué confiar en nuestra valoración?
            </h3>
            <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
              Nuestro algoritmo combina más de 15 años de experiencia en M&A con 
              datos de mercado actualizados semanalmente de más de 50,000 transacciones.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-black">500+</div>
                <div className="text-gray-600">Empresas valoradas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">€2.8B+</div>
                <div className="text-gray-600">Valor total analizado</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">95%</div>
                <div className="text-gray-600">Precisión promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesMethodology;
