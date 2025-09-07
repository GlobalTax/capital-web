import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, TrendingUp, Users, Award, ArrowRight, CheckCircle, Database, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SmartVideoPlayer from '@/components/video/SmartVideoPlayer';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const DeLooperACapittalContent = () => {
  const navigate = useNavigate();

  const trustMetrics = [
    { icon: <TrendingUp className="h-6 w-6 text-blue-600" />, value: "4+ años", label: "de experiencia" },
    { icon: <Users className="h-6 w-6 text-green-600" />, value: "500+", label: "empresas valoradas" },
    { icon: <Award className="h-6 w-6 text-purple-600" />, value: "100%", label: "datos migrados" }
  ];

  const migrationData = [
    { icon: <Database className="h-5 w-5" />, label: "Valoraciones migradas", value: "500+" },
    { icon: <Users className="h-5 w-5" />, label: "Clientes transferidos", value: "100%" },
    { icon: <Shield className="h-5 w-5" />, label: "Seguridad garantizada", value: "SSL" },
    { icon: <CheckCircle className="h-5 w-5" />, label: "Proceso completado", value: "✓" }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section - Estilo Compra Empresas */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido izquierda */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  De <span className="text-slate-600">Looper</span> a{' '}
                  <span className="text-blue-600">Capittal</span>
                </h1>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Evolucionamos para ofrecerte mejores metodologías, mayor precisión 
                  y el mismo compromiso de excelencia que nos caracteriza.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <InteractiveHoverButton
                  text="Solicitar Valoración"
                  onClick={() => navigate('/calculadora')}
                  variant="primary"
                />
                <InteractiveHoverButton
                  text="Hablar con Experto"
                  onClick={() => navigate('/contacto')}
                  variant="secondary"
                />
              </div>
            </div>

            {/* Dashboard de migración derecha */}
            <div className="relative">
              <Card className="bg-white shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Panel de Migración</h3>
                      <p className="text-sm text-slate-600">Transición Looper → Capittal</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">Completado</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {migrationData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            {item.icon}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Migración completada con éxito
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Todos los datos y valoraciones están disponibles
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Elementos flotantes */}
              <div className="absolute -top-4 -right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg border border-green-200">
                100% Datos Migrados
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg border border-blue-200">
                Mismo Equipo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Confianza con Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              La Misma Confianza, Mejores Resultados
            </h2>
            <p className="text-slate-700 max-w-2xl mx-auto">
              Nuestros clientes de Looper mantienen el mismo nivel de servicio premium, 
              ahora con las innovaciones de Capittal.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {trustMetrics.map((metric, index) => (
              <Card key={index} className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 border border-gray-100">
                    {metric.icon}
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{metric.value}</div>
                  <div className="text-sm text-slate-600 font-medium">{metric.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué el cambio - Estilo mejorado */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            ¿Por Qué Evolucionamos?
          </h2>
          <p className="text-lg text-slate-700 mb-8 leading-relaxed">
            El nombre Capittal refleja mejor nuestra especialización en capital empresarial y valoraciones. 
            Queríamos un nombre que comunicara directamente nuestra expertise y fuera más fácil de recordar.
          </p>
          <Card className="bg-gray-50 border border-gray-200 shadow-lg">
            <CardContent className="p-8">
              <p className="text-base text-slate-700 italic leading-relaxed">
                "Todas las valoraciones realizadas bajo la marca Looper siguen siendo válidas. 
                Hemos migrado todos los datos de manera segura y mantienes acceso completo a tu historial."
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Final Mejorado */}
      <section className="py-20 bg-blue-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            ¿Listo para Continuar?
          </h2>
          <p className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto">
            El mismo equipo, la misma calidad, mejores resultados. 
            Descubre cómo podemos ayudarte hoy.
          </p>
          <div className="inline-block">
            <InteractiveHoverButton
              text="Comenzar Valoración Gratuita"
              onClick={() => navigate('/calculadora')}
              variant="primary"
              className="text-lg px-10 py-4 shadow-lg hover:shadow-xl"
            />
          </div>
          <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-slate-600">
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Sin compromiso
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Datos migrados
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Mismo equipo
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DeLooperACapittalContent;