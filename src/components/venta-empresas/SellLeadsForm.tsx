import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  full_name: string;
  company: string;
  email: string;
  phone: string;
  revenue_range: string;
  message: string;
}

const SellLeadsForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    company: '',
    email: '',
    phone: '',
    revenue_range: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Enhanced client-side validation
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check required fields and lengths according to RLS policies
    if (!formData.full_name?.trim()) {
      errors.push('El nombre completo es obligatorio');
    } else if (formData.full_name.trim().length < 2 || formData.full_name.trim().length > 100) {
      errors.push('El nombre debe tener entre 2 y 100 caracteres');
    }
    
    if (!formData.company?.trim()) {
      errors.push('El nombre de la empresa es obligatorio');
    } else if (formData.company.trim().length < 2 || formData.company.trim().length > 100) {
      errors.push('El nombre de la empresa debe tener entre 2 y 100 caracteres');
    }
    
    if (!formData.email?.trim()) {
      errors.push('El email es obligatorio');
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      errors.push('El email no tiene un formato válido');
    } else if (formData.email.length > 254) {
      errors.push('El email es demasiado largo (máximo 254 caracteres)');
    }
    
    if (!formData.revenue_range) {
      errors.push('La facturación anual es obligatoria');
    } else if (!['<1M', '1-5M', '5-10M', '>10M'].includes(formData.revenue_range)) {
      errors.push('La facturación anual debe ser una de las opciones disponibles');
    }
    
    // Message is optional for sell_leads but will be stored in form_submissions
    
    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Enhanced client-side validation
      const validation = validateForm();
      if (!validation.isValid) {
        toast({
          title: "Error en el formulario",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      
      // Prepare payload for sell_leads (without message field)
      const sellLeadsPayload = {
        full_name: formData.full_name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        revenue_range: formData.revenue_range,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_term: urlParams.get('utm_term'),
        utm_content: urlParams.get('utm_content'),
        referrer: document.referrer,
        user_agent: navigator.userAgent
      };

      // Detailed logging for debugging (temporary)
      console.log('=== SELL LEADS FORM SUBMISSION ===');
      console.log('Payload being sent to sell_leads:', sellLeadsPayload);
      console.log('Payload validation:', {
        full_name_length: sellLeadsPayload.full_name.length,
        full_name_valid: sellLeadsPayload.full_name.length >= 2 && sellLeadsPayload.full_name.length <= 100,
        company_length: sellLeadsPayload.company.length,
        company_valid: sellLeadsPayload.company.length >= 2 && sellLeadsPayload.company.length <= 100,
        email_length: sellLeadsPayload.email.length,
        email_format: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(sellLeadsPayload.email),
        email_length_valid: sellLeadsPayload.email.length <= 254,
        revenue_range: sellLeadsPayload.revenue_range,
        revenue_range_valid: ['<1M', '1-5M', '5-10M', '>10M'].includes(sellLeadsPayload.revenue_range)
      });

      // Validate required fields according to RLS policy
      if (!['<1M', '1-5M', '5-10M', '>10M'].includes(sellLeadsPayload.revenue_range)) {
        toast({
          title: "Error de validación",
          description: "Por favor, selecciona un rango de facturación válido.",
          variant: "destructive",
        });
        return;
      }
      
      // Step 1: Insert into sell_leads
      console.log('=== STEP 1: INSERTING INTO sell_leads ===');
      const { data: sellLeadData, error } = await supabase.from('sell_leads').insert(sellLeadsPayload).select().single();

      if (error) {
        console.error('Error submitting sell leads form:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Enhanced rate limiting detection
        if (error.message?.includes('rate limit') || 
            error.message?.includes('check_rate_limit_enhanced') ||
            error.code === 'PGRST301' || 
            error.message?.includes('Too Many Requests')) {
          toast({
            title: "Límite de envíos alcanzado",
            description: "Solo se permiten 2 envíos por IP cada 24 horas. Si necesitas contactar urgentemente, llama al +34 695 717 490 o escribe a info@capittal.es",
            variant: "destructive",
          });
          return;
        }
        
        // Enhanced RLS policy violation detection
        if (error.message?.includes('row-level security') || 
            error.message?.includes('policy') ||
            error.code === '42501') {
          toast({
            title: "Error de validación",
            description: "Los datos del formulario no cumplen con los requisitos de seguridad. Revisa que todos los campos obligatorios estén completos.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.code === '42P10' || error.message?.includes('ON CONFLICT')) {
          toast({
            title: "Error de base de datos",
            description: "Ha ocurrido un error técnico. Por favor, contacta directamente con nosotros al +34 695 717 490",
            variant: "destructive",
          });
          return;
        }
        
        throw error;
      }

      console.log('Successfully inserted into sell_leads:', sellLeadData);

      // Step 2: Insert into form_submissions
      console.log('=== STEP 2: INSERTING INTO form_submissions ===');
      const formSubmissionPayload = {
        form_type: 'sell_lead',
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        form_data: {
          company: formData.company.trim(),
          phone: formData.phone?.trim() || null,
          revenue_range: formData.revenue_range,
          message: formData.message.trim(),
        },
        ip_address: null, // Will be set by server
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
      };

      console.log('Payload for form_submissions insert:', formSubmissionPayload);

      const { data: submissionData, error: submissionError } = await supabase
        .from('form_submissions')
        .insert(formSubmissionPayload)
        .select()
        .single();

      if (submissionError) {
        console.error('Error inserting into form_submissions:', {
          code: submissionError.code,
          message: submissionError.message,
          details: submissionError.details,
          hint: submissionError.hint
        });
        // Don't block if this fails - the main submission succeeded
      } else {
        console.log('Successfully inserted into form_submissions:', submissionData);

        // Step 3: Invoke send-form-notifications function
        console.log('=== STEP 3: INVOKING send-form-notifications FUNCTION ===');
        try {
          const functionPayload = {
            submissionId: submissionData.id,
            formType: 'sell_lead',
            email: formData.email.trim(),
            fullName: formData.full_name.trim(),
            formData: {
              company: formData.company.trim(),
              phone: formData.phone?.trim() || null,
              revenue_range: formData.revenue_range,
              message: formData.message.trim(),
            }
          };

          console.log('Function payload:', functionPayload);

          const { data: functionData, error: functionError } = await supabase.functions.invoke(
            'send-form-notifications',
            { body: functionPayload }
          );

          if (functionError) {
            console.error('Error invoking send-form-notifications function:', {
              code: functionError.code,
              message: functionError.message,
              details: functionError.details
            });
            // Non-blocking error - notification failed but form submitted
          } else {
            console.log('Successfully invoked send-form-notifications function:', functionData);
          }
        } catch (functionErr) {
          console.error('Exception invoking send-form-notifications function:', functionErr);
          // Non-blocking error
        }
      }
      
      toast({
        title: "¡Mensaje enviado con éxito!",
        description: "Hemos recibido tu consulta sobre venta de empresa. Nos pondremos en contacto contigo en las próximas 24 horas.",
      });

      setFormData({
        full_name: '',
        company: '',
        email: '',
        phone: '',
        revenue_range: '',
        message: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error al enviar",
        description: "Ha ocurrido un error inesperado. Por favor, contacta directamente con nosotros al +34 695 717 490 o info@capittal.es",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            <span className="text-primary">Contacta</span> con Nosotros
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            ¿Tienes una empresa que quieres vender? Cuéntanos tu situación 
            y te ayudaremos con asesoramiento profesional y confidencial.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div>
            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground">Respuesta Rápida</h3>
                  <p className="text-muted-foreground text-sm">Te contestamos en menos de 24 horas para analizar tu consulta</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground">100% Confidencial</h3>
                  <p className="text-muted-foreground text-sm">Tu información está protegida por acuerdos de confidencialidad</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground">Asesoramiento Experto</h3>
                  <p className="text-muted-foreground text-sm">Más de 15 años de experiencia en M&A y venta de empresas</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">¿Prefieres hablar directamente?</h3>
              <div className="space-y-3">
                <a href="tel:+34695717490" className="flex items-center text-primary hover:text-primary/80 transition-colors">
                  <span className="mr-2">📞</span>
                  +34 695 717 490
                </a>
                <a href="mailto:info@capittal.es" className="flex items-center text-primary hover:text-primary/80 transition-colors">
                  <span className="mr-2">✉️</span>
                  info@capittal.es
                </a>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <Card className="bg-card border border-border shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Tu nombre y apellidos"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Facturación Anual *
                  </label>
                  <select
                    name="revenue_range"
                    value={formData.revenue_range}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    <option value="">Selecciona el rango de facturación</option>
                    <option value="<1M">Menos de 1M€</option>
                    <option value="1-5M">Entre 1M€ y 5M€</option>
                    <option value="5-10M">Entre 5M€ y 10M€</option>
                    <option value=">10M">Más de 10M€</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mensaje
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                    placeholder="Cuéntanos sobre tu empresa, sector, facturación aproximada y qué te gustaría saber sobre la venta..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SellLeadsForm;