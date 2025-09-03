import React from 'react';
import { CheckCircle, Phone, FileText } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const VentaEmpresasHeroService = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const callExpert = () => {
    window.open('tel:+34695717490', '_self');
  };

  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50 py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Service Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Servicio Profesional M&A
            </div>

            {/* Professional Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Servicio Integral de
                <span className="text-blue-600"> Venta de Empresas</span>
              </h1>
            <p className="text-xl text-black leading-relaxed">
              Metodología probada en <strong>más de 200 operaciones</strong> exitosas. 
              Asesoramiento completo desde la valoración inicial hasta el cierre de la transacción, 
              maximizando el valor y minimizando los riesgos para nuestros clientes.
            </p>
            </div>

            {/* Service Highlights */}
            <div className="space-y-4">
              {[
                {
                  icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                  text: "Metodología estructurada en 6 fases"
                },
                {
                  icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                  text: "Due diligence completo y profesional"
                },
                {
                  icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                  text: "Negociación experta y cierre exitoso"
                },
                {
                  icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                  text: "Integración con servicios legales y fiscales"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {item.icon}
                  <span className="text-black">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Professional CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <InteractiveHoverButton
                variant="primary"
                size="lg"
                onClick={scrollToContact}
                className="text-base px-6 py-3"
              >
                Consulta
              </InteractiveHoverButton>
              
              <InteractiveHoverButton
                variant="secondary"
                size="lg"
                onClick={callExpert}
                className="text-base px-6 py-3"
              >
                <Phone className="mr-2 h-5 w-5" />
                Especialista
              </InteractiveHoverButton>
            </div>

            {/* Service Integration Note */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <FileText className="inline h-4 w-4 mr-2" />
                <strong>Servicio integrado:</strong> Parte de nuestro ecosistema completo de servicios M&A, 
                que incluye asesoramiento legal, planificación fiscal y due diligence tecnológico.
              </p>
            </div>
          </div>

          {/* Professional Stats Card */}
          <div className="relative">
            <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">M&A</span>
                </div>
                
                <h3 className="text-2xl font-bold text-black">Resultados Profesionales</h3>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-black">200+</div>
                    <div className="text-sm text-black">Operaciones</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-black">€2.5B+</div>
                    <div className="text-sm text-black">Volumen gestionado</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-black">98,7%</div>
                    <div className="text-sm text-black">Tasa de éxito</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-black">5.5x</div>
                    <div className="text-sm text-black">Múltiplo promedio</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-black">Sectores de Especialización</h4>
                  <div className="text-sm text-black space-y-1">
                    <div>• Tecnología y Software</div>
                    <div>• E-commerce y Retail</div>
                    <div>• Servicios Profesionales</div>
                    <div>• Manufacturas Especializadas</div>
                    <div>• Healthcare y Wellness</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Experiencia comprobada</strong> en operaciones desde €500K hasta €50M+
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasHeroService;