
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
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6">
            Metodologías de Valoración Profesional
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Aplicamos las técnicas más reconocidas internacionalmente, 
            utilizadas por las principales firmas de investment banking y consultoras estratégicas.
          </p>
        </div>

        {/* Metodologías principales */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {metodologias.map((metodologia, index) => {
            const Icon = metodologia.icon;
            return (
              <div key={index} className="group">
                <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-primary transition-colors h-full">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {metodologia.titulo}
                        </h3>
                        <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                          {metodologia.precision}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4">
                        {metodologia.descripcion}
                      </p>
                      <div className="text-sm text-primary font-medium mb-4">
                        Aplicación: {metodologia.aplicacion}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Ventajas</h4>
                      <ul className="space-y-1">
                        {metodologia.ventajas.map((ventaja, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start">
                            <span className="w-1 h-1 bg-slate-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {ventaja}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Limitaciones</h4>
                      <ul className="space-y-1">
                        {metodologia.limitaciones.map((limitacion, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start">
                            <span className="w-1 h-1 bg-slate-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
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
        <div className="bg-slate-50 rounded-lg p-6 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">
              Factores Clave que Influyen en la Valoración
            </h3>
            <p className="text-slate-600 max-w-3xl mx-auto">
              Más allá de las métricas financieras, estos factores cualitativos pueden 
              impactar significativamente en la valoración final
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {factoresClave.map((factor, index) => {
              const Icon = factor.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-4 text-center border border-slate-200">
                  <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">
                    {factor.titulo}
                  </h4>
                  <p className="text-xs text-slate-600 mb-2">
                    {factor.descripcion}
                  </p>
                  <span className="text-xs font-medium text-primary">
                    Impacto: {factor.impacto}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              ¿Por qué confiar en nuestra valoración?
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Nuestro algoritmo combina más de 15 años de experiencia en M&A con 
              datos de mercado actualizados semanalmente de más de 50,000 transacciones.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-semibold text-slate-900">500+</div>
                <div className="text-slate-600">Empresas valoradas</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-900">€902M</div>
                <div className="text-slate-600">Valor total analizado</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-900">98,7%</div>
                <div className="text-slate-600">Precisión promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesMethodology;
