import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Phone, Mail, CheckCircle } from 'lucide-react';

const AcquisitionCTA = () => {

  return (
    <section id="contact-form" className="py-16 bg-slate-25">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 mb-4">
            Solicitar <span className="text-primary">Análisis de Oportunidades</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Completa este formulario y recibe un análisis personalizado de las mejores oportunidades 
            de adquisición alineadas con tu estrategia.
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Left column - Form */}
            <div className="p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Solicita Información sobre Oportunidades
                </h3>
                <p className="text-slate-600 text-sm">
                  Completa el formulario y nuestro equipo te contactará para discutir 
                  oportunidades que se alineen con tus objetivos.
                </p>
              </div>
              <div className="space-y-4">
                <InteractiveHoverButton
                  text="Contactar por Teléfono"
                  variant="primary"
                  size="lg"
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={() => window.open('tel:+34911237778')}
                />
                <InteractiveHoverButton
                  text="Enviar Email"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => window.open('mailto:adquisiciones@capittal.es')}
                />
              </div>
            </div>
            
            {/* Right column - Contact info */}
            <div className="bg-slate-25 border-l border-slate-100 p-6 lg:p-8">
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-4">
                  Contacto Directo
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-primary mt-1" />
                    <div>
                      <div className="font-medium text-slate-900 text-sm">Teléfono</div>
                      <div className="text-slate-600 text-sm">+34 911 23 77 78</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-primary mt-1" />
                    <div>
                      <div className="font-medium text-slate-900 text-sm">Email</div>
                      <div className="text-slate-600 text-sm">adquisiciones@capittal.es</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-6">
                <h5 className="font-semibold text-slate-900 mb-3 text-sm">
                  ¿Qué incluye nuestro análisis?
                </h5>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Valoración de oportunidades estratégicas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Análisis de sinergias potenciales
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Valoración preliminar del target
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Estructura de transacción recomendada
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Timeline y próximos pasos
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcquisitionCTA;