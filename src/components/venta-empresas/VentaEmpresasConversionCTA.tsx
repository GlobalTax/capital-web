import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Phone, Clock } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { useVentaEmpresasForm } from '@/hooks/useVentaEmpresasForm';
import { toast } from 'sonner';
import VentaEmpresasSuccessModal from './VentaEmpresasSuccessModal';
import { useFormSecurity } from '@/hooks/useFormSecurity';
import { ventaEmpresasSchema } from '@/schemas/formSchemas';
import { formatNumberWithDots, parseNumberWithDots } from '@/utils/numberFormatting';

const VentaEmpresasConversionCTA = () => {
  const { submitForm, isSubmitting } = useVentaEmpresasForm();
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    cif: '',
    revenue: '',
    ebitda: '',
    urgency: 'medium'
  });
  
  const {
    honeypotProps,
    honeypotValue,
    setHoneypotValue,
    isBot,
    isSubmissionTooFast,
    checkRateLimit,
  } = useFormSecurity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Seguridad: Detectar bots
    if (isBot()) {
      console.warn('Bot detectado en VentaEmpresasForm');
      return; // Silent fail
    }

    // Seguridad: Detectar envíos demasiado rápidos
    if (isSubmissionTooFast()) {
      toast.error("Por favor, tómate tu tiempo para completar el formulario.");
      return;
    }

    // Validación con Zod
    try {
      ventaEmpresasSchema.parse(formData);
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || "Verifica los datos del formulario");
      return;
    }

    // Seguridad: Rate limiting
    if (!checkRateLimit(formData.email)) {
      toast.error("Has alcanzado el límite de envíos. Por favor, espera un momento.");
      return;
    }
    
    // Normalizar valores numéricos antes de enviar (quitar puntos de miles)
    const normalizedFormData = {
      ...formData,
      revenue: parseNumberWithDots(formData.revenue).toString(),
      ebitda: formData.ebitda ? parseNumberWithDots(formData.ebitda).toString() : ''
    };

    const result = await submitForm(normalizedFormData);
    
    if (result.success) {
      setIsSuccess(true);
      toast.success('¡Solicitud enviada! Te contactaremos en 24h');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        cif: '',
        revenue: '',
        ebitda: '',
        urgency: 'medium'
      });
    } else {
      toast.error(result.error || 'Error al enviar. Por favor, intenta de nuevo.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handler especializado para campos numéricos con formato de miles
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Solo permitir dígitos
    const cleanValue = value.replace(/[^\d]/g, '');
    
    // Formatear con puntos de miles
    const formattedValue = cleanValue ? formatNumberWithDots(cleanValue) : '';
    
    setFormData({
      ...formData,
      [name]: formattedValue
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

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              ¡Vende Tu Empresa al
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Mejor Precio</span> 
              en Tiempo Récord!
            </h2>

            <p className="text-xl text-blue-100 leading-relaxed">
              <strong className="text-white">¡No esperes más!</strong> Cada día que pasa pierdes oportunidades de venta. 
              <strong className="text-yellow-400">Actúa AHORA</strong> y consigue compradores cualificados dispuestos a 
              pagar el MÁXIMO por tu empresa.
            </p>

            {/* Benefits Checklist */}
            <div className="space-y-4">
            {[
              "✅ Consulta GRATUITA con experto en 48h",
              "✅ Acceso a red exclusiva de compradores cualificados",
              "✅ Estrategia personalizada para MAXIMIZAR precio de venta",
              "✅ Proceso 100% confidencial y profesional"
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
                  href="tel:+34695717490"
                  className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors duration-200"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  📞 695 717 490
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
                  ¡Empieza a Vender Tu Empresa HOY!
                </h3>
                <p className="text-gray-600">
                  Completa el formulario y te contactamos en 48h con los primeros pasos
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field - invisible para usuarios reales */}
                <input
                  {...honeypotProps}
                  value={honeypotValue}
                  onChange={(e) => setHoneypotValue(e.target.value)}
                />
                
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
                    CIF de la empresa *
                  </label>
                  <input
                    type="text"
                    name="cif"
                    value={formData.cif}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 uppercase"
                    placeholder="Ej: B12345674"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facturación anual (€) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="revenue"
                    required
                    value={formData.revenue}
                    onChange={handleNumericChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Ej: 2.500.000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ventas anuales de tu empresa
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EBITDA anual (€)
                    <span className="text-gray-400 text-xs ml-1">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="ebitda"
                    value={formData.ebitda}
                    onChange={handleNumericChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Ej: 500.000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Beneficio antes de intereses, impuestos, depreciación y amortización
                  </p>
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
                  text={isSubmitting ? 'Enviando...' : 'Enviar'}
                  className="w-full text-lg py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl"
                  disabled={isSubmitting}
                />

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
              SIN COSTE
            </div>
            <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              RESPUESTA 48H
            </div>
          </div>
        </div>
      </div>

      <VentaEmpresasSuccessModal 
        isOpen={isSuccess} 
        onClose={() => setIsSuccess(false)} 
      />
    </section>
  );
};

export default VentaEmpresasConversionCTA;
