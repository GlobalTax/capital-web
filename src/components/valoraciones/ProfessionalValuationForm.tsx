import React, { useState } from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { useFormSecurity } from '@/hooks/useFormSecurity';
import { professionalValuationSchema } from '@/schemas/formSchemas';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ProfessionalValuationForm = () => {
  const {
    honeypotProps,
    honeypotValue,
    setHoneypotValue,
    isBot,
    isSubmissionTooFast,
    checkRateLimit,
    recordSubmissionAttempt,
    getTrackingData,
  } = useFormSecurity();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    revenue_range: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones de seguridad
    if (isBot()) {
      console.warn('Bot detected');
      return;
    }

    if (isSubmissionTooFast()) {
      toast.error('Por favor, tómate un momento para revisar el formulario');
      return;
    }

    if (!checkRateLimit(formData.email)) {
      toast.error('Has enviado demasiadas solicitudes. Por favor, espera unos minutos.');
      return;
    }

    // Validación con Zod
    const validation = professionalValuationSchema.safeParse(formData);
    
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener datos de tracking
      const trackingData = await getTrackingData();

      // Guardar en Supabase
      const { error } = await supabase
        .from('general_contact_leads')
        .insert({
          full_name: validation.data.name,
          email: validation.data.email,
          company: validation.data.company,
          message: validation.data.message || null,
          source_form: 'professional_valuation',
          page_origin: '/servicios/valoraciones',
          priority: 'high',
          status: 'new',
          additional_data: {
            revenue_range: validation.data.revenue_range,
          },
          // Tracking data
          utm_source: trackingData.utm_source,
          utm_medium: trackingData.utm_medium,
          utm_campaign: trackingData.utm_campaign,
          utm_content: trackingData.utm_content,
          utm_term: trackingData.utm_term,
          referrer: trackingData.referrer,
          user_agent: trackingData.user_agent,
          ip_address: trackingData.ip_address,
        });

      if (error) throw error;

      // Registrar intento para rate limiting
      recordSubmissionAttempt(validation.data.email);

      // Feedback de éxito
      toast.success('¡Solicitud enviada! Te contactaremos en 24 horas', {
        duration: 5000,
      });

      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        company: '',
        revenue_range: '',
        message: '',
      });
      setErrors({});

    } catch (error) {
      console.error('Error submitting professional valuation form:', error);
      toast.error('Hubo un error al enviar la solicitud. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      {/* Honeypot field */}
      <input
        {...honeypotProps}
        value={honeypotValue}
        onChange={(e) => setHoneypotValue(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`capittal-input w-full ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Nombre"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`capittal-input w-full ${errors.email ? 'border-red-500' : ''}`}
            placeholder="Email"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
      </div>
      
      <div>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className={`capittal-input w-full ${errors.company ? 'border-red-500' : ''}`}
          placeholder="Empresa"
          disabled={isSubmitting}
        />
        {errors.company && (
          <p className="text-red-500 text-xs mt-1">{errors.company}</p>
        )}
      </div>
      
      <div>
        <select
          name="revenue_range"
          value={formData.revenue_range}
          onChange={handleChange}
          className={`capittal-input w-full ${errors.revenue_range ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
        >
          <option value="">Selecciona facturación anual</option>
          <option value="<1M">Menos de 1M€</option>
          <option value="1M-5M">1M€ - 5M€</option>
          <option value="5M-10M">5M€ - 10M€</option>
          <option value="10M-25M">10M€ - 25M€</option>
          <option value="25M-50M">25M€ - 50M€</option>
          <option value=">50M">Más de 50M€</option>
        </select>
        {errors.revenue_range && (
          <p className="text-red-500 text-xs mt-1">{errors.revenue_range}</p>
        )}
      </div>
      
      <div>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          className={`capittal-input w-full h-20 resize-none ${errors.message ? 'border-red-500' : ''}`}
          placeholder="Cuéntanos el propósito de la valoración..."
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="text-red-500 text-xs mt-1">{errors.message}</p>
        )}
      </div>
      
      <InteractiveHoverButton 
        text={isSubmitting ? "Enviando..." : "Solicitar Presupuesto"}
        variant="primary"
        size="lg"
        className="w-full"
        type="submit"
        disabled={isSubmitting}
      />
    </form>
  );
};
