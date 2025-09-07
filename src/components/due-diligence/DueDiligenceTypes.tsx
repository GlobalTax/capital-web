import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Badge } from '@/components/ui/badge';
import { Search, Building, CheckCircle, Target, Users, FileText, BarChart3, Clock } from 'lucide-react';

const DueDiligenceTypes = () => {
  const buyersideFeatures = [
    { icon: <Search size={20} />, text: "**Análisis de riesgos exhaustivo**" },
    { icon: <BarChart3 size={20} />, text: "**Validación de proyecciones financieras**" },
    { icon: <FileText size={20} />, text: "**Due diligence legal completo**" },
    { icon: <Target size={20} />, text: "**Identificación de sinergias**" }
  ];

  const vendorFeatures = [
    { icon: <Building size={20} />, text: "**Preparación para la venta**" },
    { icon: <CheckCircle size={20} />, text: "**Identificación de value gaps**" },
    { icon: <Users size={20} />, text: "**Optimización de procesos**" },
    { icon: <Clock size={20} />, text: "**Aceleración del proceso M&A**" }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            **Dos Enfoques, Dos Objetivos**
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            **Adaptamos nuestro due diligence según tu posición en la transacción. 
            Buy-side para compradores, Vendor para vendedores.**
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Buy-side Due Diligence */}
          <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
              **Más Solicitado**
            </div>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Search className="text-white" size={24} />
                  </div>
                  <div>
                    <Badge className="bg-blue-100 text-blue-800 mb-2">Para Compradores</Badge>
                    <h3 className="text-2xl font-bold text-black">**Buy-side Due Diligence**</h3>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  **Análisis exhaustivo antes de la adquisición. Identificamos riesgos, 
                  validamos información del vendedor y evaluamos el verdadero potencial de la inversión.**
                </p>

                <div className="space-y-4">
                  <h4 className="font-bold text-black">**¿Cuándo lo necesitas?**</h4>
                  <ul className="space-y-3">
                    {buyersideFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="text-blue-600">{feature.icon}</div>
                        <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: feature.text }} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-800">**Tiempo típico**</span>
                    <span className="text-sm font-bold text-blue-900">**6-8 semanas**</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">**Inversión desde**</span>
                    <span className="text-sm font-bold text-blue-900">**€15,000**</span>
                  </div>
                </div>

                <InteractiveHoverButton
                  text="**Solicitar Buy-side DD**"
                  variant="primary"
                  size="lg"
                  className="w-full bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vendor Due Diligence */}
          <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Building className="text-white" size={24} />
                  </div>
                  <div>
                    <Badge className="bg-purple-100 text-purple-800 mb-2">Para Vendedores</Badge>
                    <h3 className="text-2xl font-bold text-black">**Vendor Due Diligence**</h3>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  **Preparación estratégica para la venta. Identificamos y solucionamos problemas 
                  potenciales antes de que los compradores los encuentren, maximizando el valor.**
                </p>

                <div className="space-y-4">
                  <h4 className="font-bold text-black">**¿Cuándo lo necesitas?**</h4>
                  <ul className="space-y-3">
                    {vendorFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="text-purple-600">{feature.icon}</div>
                        <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: feature.text }} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-purple-800">**Tiempo típico**</span>
                    <span className="text-sm font-bold text-purple-900">**4-6 semanas**</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-800">**ROI promedio**</span>
                    <span className="text-sm font-bold text-purple-900">**+15% en valoración**</span>
                  </div>
                </div>

                <InteractiveHoverButton
                  text="**Solicitar Vendor DD**"
                  variant="primary" 
                  size="lg"
                  className="w-full bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-2xl font-bold text-black mb-4">
            **¿No sabes cuál necesitas?**
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            **Nuestros expertos te ayudan a determinar el enfoque óptimo según tu situación específica. 
            Consulta inicial gratuita de 30 minutos.**
          </p>
          <InteractiveHoverButton
            text="**Consulta Gratuita**"
            variant="outline"
            size="lg"
            className="border-black text-black hover:bg-black hover:text-white"
          />
        </div>
      </div>
    </section>
  );
};

export default DueDiligenceTypes;