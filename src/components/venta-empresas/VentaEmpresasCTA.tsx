
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Calendar, Download } from 'lucide-react';

const VentaEmpresasCTA = () => {
  return (
    <section className="carta-section bg-primary text-primary-foreground">
      <div className="carta-container">
        <div className="text-center mb-16">
          <h2 className="font-semibold mb-6 text-primary-foreground">
            ¿Listo para Vender tu Empresa?
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Da el primer paso hacia la venta exitosa de tu empresa. 
            Nuestros expertos están listos para ayudarte a maximizar el valor de tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold mb-8 text-primary-foreground">
              Comienza tu Proceso de Venta Hoy
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-primary-foreground text-primary rounded-full w-12 h-12 flex items-center justify-center">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-primary-foreground">Consulta Inicial Gratuita</h4>
                  <p className="text-primary-foreground/80">Evaluación preliminar sin compromiso</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-primary-foreground text-primary rounded-full w-12 h-12 flex items-center justify-center">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-primary-foreground">Valoración Detallada</h4>
                  <p className="text-primary-foreground/80">Análisis completo del valor de tu empresa</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-primary-foreground text-primary rounded-full w-12 h-12 flex items-center justify-center">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-primary-foreground">Estrategia Personalizada</h4>
                  <p className="text-primary-foreground/80">Plan específico para tu situación</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-primary-foreground/10 rounded-lg border border-primary-foreground/20">
              <h4 className="text-lg font-semibold mb-4 text-primary-foreground">¿Por qué actuar ahora?</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>• Las condiciones de mercado son favorables</li>
                <li>• Los múltiplos de valoración están en máximos</li>
                <li>• Hay abundante liquidez en el mercado</li>
                <li>• La competencia por activos de calidad es alta</li>
              </ul>
            </div>
          </div>

          <div className="bg-background text-foreground rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-center mb-8">
              Solicita tu Valoración Gratuita
            </h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="carta-input w-full"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    className="carta-input w-full"
                    placeholder="Tus apellidos"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="carta-input w-full"
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="carta-input w-full"
                  placeholder="+34 600 000 000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre de tu empresa
                </label>
                <input
                  type="text"
                  className="carta-input w-full"
                  placeholder="Nombre de la empresa"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Facturación anual
                </label>
                <select className="carta-input w-full">
                  <option>Selecciona un rango</option>
                  <option>Menos de 1M€</option>
                  <option>1M€ - 5M€</option>
                  <option>5M€ - 10M€</option>
                  <option>10M€ - 25M€</option>
                  <option>25M€ - 50M€</option>
                  <option>Más de 50M€</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  className="carta-input w-full h-24 resize-none"
                  placeholder="Cuéntanos más sobre tu empresa y objetivos..."
                ></textarea>
              </div>
              
              <Button className="carta-button w-full text-base py-4">
                Solicitar Valoración Gratuita
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                Al enviar este formulario, aceptas que nos pongamos en contacto contigo 
                para discutir la venta de tu empresa de forma confidencial.
              </p>
            </form>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="carta-card bg-primary-foreground/10 border-primary-foreground/20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6 text-primary-foreground">Contacto Directo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-4 text-primary-foreground/80" />
                <h4 className="font-semibold mb-2 text-primary-foreground">Teléfono</h4>
                <p className="text-primary-foreground/80">+34 91 234 5678</p>
                <p className="text-sm text-primary-foreground/60">L-V 9:00 - 18:00</p>
              </div>
              
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-4 text-primary-foreground/80" />
                <h4 className="font-semibold mb-2 text-primary-foreground">Email</h4>
                <p className="text-primary-foreground/80">venta@capittal.com</p>
                <p className="text-sm text-primary-foreground/60">Respuesta en 24h</p>
              </div>
              
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-4 text-primary-foreground/80" />
                <h4 className="font-semibold mb-2 text-primary-foreground">Reunión</h4>
                <p className="text-primary-foreground/80">Agenda una llamada</p>
                <p className="text-sm text-primary-foreground/60">30 min gratuitos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasCTA;
