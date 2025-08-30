import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Phone, Mail, Clock } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const VentaEmpresasConversionCTA = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    revenue: '',
    urgency: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg')] opacity-5"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            {/* Urgency Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-red-500 bg-opacity-20 text-red-300 rounded-full text-lg font-bold border border-red-500 animate-pulse">
              🔥 ¡ÚLTIMAS 3 PLAZAS DISPONIBLES! 🔥
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              ¡Consigue Tu
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Valoración GRATUITA</span> 
              en 48 Horas!
            </h2>

            <p className="text-xl text-blue-100 leading-relaxed">
              <strong className="text-white">¡No esperes más!</strong> Cada día que pasa sin vender tu empresa, 
              estás perdiendo oportunidades. <strong className="text-yellow-400">Actúa AHORA</strong> y descubre 
              el verdadero valor de tu negocio.
            </p>

            {/* Benefits Checklist */}
            <div className="space-y-4">
              {[
                "✅ Valoración profesional GRATUITA en 48h",
                "✅ Análisis completo de oportunidades de mejora",
                "✅ Estrategia personalizada para MAXIMIZAR precio",
                "✅ Primera consulta con experto SIN COMPROMISO",
                "✅ Confidencialidad TOTAL garantizada"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-lg text-green-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
              <h4 className="font-bold mb-3">Lo que dicen nuestros clientes:</h4>
              <div className="text-yellow-300 mb-2">⭐⭐⭐⭐⭐</div>
              <p className="italic text-blue-100">
                "Capittal vendió mi empresa por €1.8M cuando yo esperaba €1.3M máximo. 
                ¡Increíble equipo y resultados espectaculares!"
              </p>
              <p className="text-sm text-yellow-400 mt-2">- Carlos Mendez, Ex-CEO TechFlow</p>
            </div>

            {/* Contact Options */}
            <div className="space-y-4">
              <h4 className="text-xl font-bold">¿Prefieres llamar directamente?</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="tel:+34900123456"
                  className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors duration-200"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  📞 900 123 456
                </a>
                <div className="text-sm text-blue-200 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  L-V: 9:00-19:00 | Sáb: 10:00-14:00
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="relative">
            <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white border-opacity-30">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Solicita Tu Valoración GRATIS!
                </h3>
                <p className="text-gray-600">
                  Completa el formulario y recibe tu valoración profesional en 48 horas
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Tu nombre y apellidos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de tu empresa *
                  </label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facturación anual aproximada *
                  </label>
                  <select
                    name="revenue"
                    required
                    value={formData.revenue}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Selecciona un rango</option>
                    <option value="500k-1m">€500K - €1M</option>
                    <option value="1m-3m">€1M - €3M</option>
                    <option value="3m-10m">€3M - €10M</option>
                    <option value="10m-25m">€10M - €25M</option>
                    <option value="25m+">€25M+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Cuánta urgencia tienes?
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="low">Solo explorando opciones</option>
                    <option value="medium">Vendería en 6-12 meses</option>
                    <option value="high">Quiero vender cuanto antes</option>
                    <option value="urgent">¡Situación urgente!</option>
                  </select>
                </div>

                <InteractiveHoverButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full text-lg py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl"
                >
                  🚀 ¡SOLICITAR VALORACIÓN GRATUITA AHORA!
                  <ArrowRight className="ml-2 h-5 w-5" />
                </InteractiveHoverButton>

                <div className="text-center">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Al enviar este formulario, aceptas que te contactemos para ofrecerte nuestros servicios. 
                    Tus datos están protegidos y no los compartimos con terceros.
                  </p>
                </div>
              </form>

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Datos seguros</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Sin spam</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Respuesta en 24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Guarantees */}
            <div className="absolute -top-4 -right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              ¡GRATIS!
            </div>
            <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              48 HORAS
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasConversionCTA;