import React, { useState } from 'react';
import { CheckCircle, Phone, Clock, Shield, TrendingUp, Users } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { useVentaEmpresasForm } from '@/hooks/useVentaEmpresasForm';
import { toast } from 'sonner';
import VentaEmpresasSuccessModal from './VentaEmpresasSuccessModal';
import { useFormSecurity } from '@/hooks/useFormSecurity';
import { ventaEmpresasSchema } from '@/schemas/formSchemas';
import { formatNumberWithDots, parseNumberWithDots } from '@/utils/numberFormatting';

const VentaEmpresasHeroWithForm = () => {
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
    
    if (isBot()) {
      console.warn('Bot detectado en VentaEmpresasForm V2');
      return;
    }

    if (isSubmissionTooFast()) {
      toast.error("Por favor, tómate tu tiempo para completar el formulario.");
      return;
    }

    try {
      ventaEmpresasSchema.parse(formData);
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || "Verifica los datos del formulario");
      return;
    }

    if (!checkRateLimit(formData.email)) {
      toast.error("Has alcanzado el límite de envíos. Por favor, espera un momento.");
      return;
    }
    
    const normalizedFormData = {
      ...formData,
      revenue: parseNumberWithDots(formData.revenue).toString(),
      ebitda: formData.ebitda ? parseNumberWithDots(formData.ebitda).toString() : ''
    };

    const result = await submitForm(normalizedFormData);
    
    if (result.success) {
      setIsSuccess(true);
      toast.success('¡Solicitud enviada! Te contactaremos en 24h');
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

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cleanValue = value.replace(/[^\d]/g, '');
    const formattedValue = cleanValue ? formatNumberWithDots(cleanValue) : '';
    setFormData({
      ...formData,
      [name]: formattedValue
    });
  };

  return (
    <section className="bg-background text-foreground relative overflow-hidden">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/30"></div>
      
      <div className="container mx-auto px-4 py-8 lg:py-16 relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {/* Left Content - Copy */}
          <div className="space-y-6 lg:space-y-8 pt-4 lg:pt-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-emerald-600 text-sm font-medium">+200 operaciones exitosas</span>
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground">
              Vende tu empresa al
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent"> máximo precio</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Accede a nuestra <strong className="text-foreground">red exclusiva de compradores cualificados</strong> y 
              maximiza el valor de tu empresa con asesoramiento profesional.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Shield, text: "100% Confidencial" },
                { icon: TrendingUp, text: "Máximo precio" },
                { icon: Users, text: "+500 compradores" },
                { icon: Clock, text: "Respuesta en 48h" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3 border border-border">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                  <span className="text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social Proof - Desktop only */}
            <div className="hidden lg:block bg-muted/50 rounded-xl p-6 border border-border">
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
              <p className="italic text-muted-foreground">
                "Capittal vendió mi empresa por €1.8M cuando yo esperaba €1.3M máximo. 
                ¡Resultados espectaculares!"
              </p>
              <p className="text-sm text-emerald-600 mt-3 font-medium">— Carlos Mendez, Ex-CEO TechFlow</p>
            </div>

            {/* Phone CTA - Desktop only */}
            <div className="hidden lg:flex items-center gap-4">
              <a 
                href="tel:+34695717490"
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Phone className="h-5 w-5" />
                695 717 490
              </a>
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                L-V: 9:00-19:00
              </span>
            </div>
          </div>

          {/* Right Form */}
          <div className="relative">
            <div className="bg-card rounded-2xl p-6 lg:p-8 shadow-2xl border border-border">
              <div className="text-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
                  Solicita tu consulta gratuita
                </h2>
                <p className="text-muted-foreground text-sm">
                  Te contactamos en 48h con los primeros pasos
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  {...honeypotProps}
                  value={honeypotValue}
                  onChange={(e) => setHoneypotValue(e.target.value)}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-background text-foreground"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-background text-foreground"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-background text-foreground"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-background text-foreground"
                      placeholder="Nombre empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      CIF *
                    </label>
                    <input
                      type="text"
                      name="cif"
                      value={formData.cif}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-background text-foreground uppercase"
                      placeholder="B12345678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Facturación anual (€) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="revenue"
                      required
                      value={formData.revenue}
                      onChange={handleNumericChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-background text-foreground"
                      placeholder="2.500.000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      EBITDA (€) <span className="text-muted-foreground text-xs">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="ebitda"
                      value={formData.ebitda}
                      onChange={handleNumericChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-background text-foreground"
                      placeholder="500.000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Urgencia
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-background text-foreground"
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
                  text={isSubmitting ? 'Enviando...' : 'Solicitar consulta gratuita'}
                  className="w-full text-lg py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-xl"
                  disabled={isSubmitting}
                />

                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Al enviar, aceptas que te contactemos. Tus datos están protegidos.
                </p>
              </form>

              {/* Trust Indicators */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Datos seguros</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Sin spam</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Respuesta 48h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
              SIN COSTE
            </div>
            <div className="absolute -bottom-3 -left-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              RESPUESTA 48H
            </div>
          </div>
        </div>

        {/* Mobile Phone CTA */}
        <div className="lg:hidden mt-8 flex justify-center">
          <a 
            href="tel:+34695717490"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Phone className="h-5 w-5" />
            Llamar: 695 717 490
          </a>
        </div>
      </div>

      <VentaEmpresasSuccessModal 
        isOpen={isSuccess} 
        onClose={() => setIsSuccess(false)} 
      />
    </section>
  );
};

export default VentaEmpresasHeroWithForm;
