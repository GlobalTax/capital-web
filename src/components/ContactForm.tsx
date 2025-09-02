import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, Shield } from 'lucide-react';
import { useContactForm } from '@/hooks/useContactForm';
import { type ContactFormData } from '@/schemas/contactFormSchema';

interface ContactFormProps {
  pageOrigin?: string;
  showTitle?: boolean;
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  pageOrigin = 'unknown', 
  showTitle = true,
  className = '' 
}) => {
  const { submitContactForm, isSubmitting } = useContactForm();
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    companySize: '',
    referral: '',
    message: '',
    website: '', // Honeypot field
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📋 ContactForm: Starting submission', { pageOrigin, hasRequiredFields: !!(formData.fullName && formData.company && formData.email) });
    
    const result = await submitContactForm(formData, pageOrigin);
    
    if (result.success) {
      console.log('📋 ContactForm: Submission successful, resetting form');
      // Reset form on success
      setFormData({
        fullName: '',
        company: '',
        email: '',
        phone: '',
        country: '',
        companySize: '',
        referral: '',
        message: '',
        website: '',
      });
    } else {
      console.error('📋 ContactForm: Submission failed', result.error);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      {showTitle && (
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            Consulta Gratuita
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Te ayudaremos con una valoración preliminar gratuita de tu empresa
          </p>
        </CardHeader>
      )}
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot field - completely hidden from users and screen readers */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="website">Website (leave empty):</label>
            <input
              id="website"
              name="website"
              type="text"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Required Fields Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Información requerida</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Nombre completo *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Tu nombre y apellidos"
                  className="mt-1"
                  disabled={isSubmitting}
                  aria-describedby="fullName-help"
                  aria-required="true"
                />
                <p id="fullName-help" className="text-xs text-muted-foreground mt-1">
                  Mínimo 2 caracteres
                </p>
              </div>
              
              <div>
                <Label htmlFor="company" className="text-sm font-medium">
                  Empresa *
                </Label>
                <Input
                  id="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Nombre de tu empresa"
                  className="mt-1"
                  disabled={isSubmitting}
                  aria-describedby="company-help"
                  aria-required="true"
                />
                <p id="company-help" className="text-xs text-muted-foreground mt-1">
                  Empresa o proyecto empresarial
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email de contacto *
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@email.com"
                className="mt-1"
                disabled={isSubmitting}
                aria-describedby="email-help"
                aria-required="true"
              />
              <p id="email-help" className="text-xs text-muted-foreground mt-1">
                Te contactaremos a este email
              </p>
            </div>
          </div>

          {/* Optional Fields Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Información adicional (opcional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+34 600 000 000"
                  className="mt-1"
                  disabled={isSubmitting}
                  aria-describedby="phone-help"
                />
                <p id="phone-help" className="text-xs text-muted-foreground mt-1">
                  Formato español recomendado
                </p>
              </div>
              
              <div>
                <Label htmlFor="country" className="text-sm font-medium">
                  País
                </Label>
                <Select 
                  value={formData.country || ''} 
                  onValueChange={(value) => handleSelectChange('country', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1" aria-describedby="country-help">
                    <SelectValue placeholder="Selecciona tu país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="españa">España</SelectItem>
                    <SelectItem value="portugal">Portugal</SelectItem>
                    <SelectItem value="francia">Francia</SelectItem>
                    <SelectItem value="italia">Italia</SelectItem>
                    <SelectItem value="reino_unido">Reino Unido</SelectItem>
                    <SelectItem value="alemania">Alemania</SelectItem>
                    <SelectItem value="mexico">México</SelectItem>
                    <SelectItem value="colombia">Colombia</SelectItem>
                    <SelectItem value="argentina">Argentina</SelectItem>
                    <SelectItem value="chile">Chile</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <p id="country-help" className="text-xs text-muted-foreground mt-1">
                  Opcional
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companySize" className="text-sm font-medium">
                  Tamaño de empresa
                </Label>
                <Select 
                  value={formData.companySize || ''} 
                  onValueChange={(value) => handleSelectChange('companySize', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1" aria-describedby="companySize-help">
                    <SelectValue placeholder="Ingresos anuales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menos_100k">Menos de €100.000</SelectItem>
                    <SelectItem value="100k_500k">€100.000 - €500.000</SelectItem>
                    <SelectItem value="500k_1m">€500.000 - €1M</SelectItem>
                    <SelectItem value="1m_5m">€1M - €5M</SelectItem>
                    <SelectItem value="5m_20m">€5M - €20M</SelectItem>
                    <SelectItem value="mas_20m">Más de €20M</SelectItem>
                  </SelectContent>
                </Select>
                <p id="companySize-help" className="text-xs text-muted-foreground mt-1">
                  Ayuda a personalizar nuestro servicio
                </p>
              </div>
              
              <div>
                <Label htmlFor="referral" className="text-sm font-medium">
                  ¿Cómo nos conociste?
                </Label>
                <Select 
                  value={formData.referral || ''} 
                  onValueChange={(value) => handleSelectChange('referral', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1" aria-describedby="referral-help">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google / Búsqueda</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referencia">Referencia / Recomendación</SelectItem>
                    <SelectItem value="prensa">Prensa / Artículo</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="redes_sociales">Redes sociales</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <p id="referral-help" className="text-xs text-muted-foreground mt-1">
                  Nos ayuda a mejorar nuestro servicio
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                Mensaje adicional
              </Label>
              <Textarea
                id="message"
                value={formData.message || ''}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Cuéntanos brevemente sobre tu empresa y qué tipo de valoración necesitas..."
                rows={3}
                className="mt-1"
                disabled={isSubmitting}
                aria-describedby="message-help"
              />
              <p id="message-help" className="text-xs text-muted-foreground mt-1">
                Opcional - Ayúdanos a preparar mejor nuestra consulta
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
              disabled={isSubmitting}
              aria-describedby="submit-help"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando consulta...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Enviar Consulta Gratuita
                </>
              )}
            </Button>
            
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <p id="submit-help">
                Tus datos están protegidos y no serán compartidos con terceros
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-xs text-muted-foreground text-center space-y-1 pt-2 border-t border-border">
            <p>Límite de seguridad: 5 consultas cada 10 minutos por dispositivo</p>
            <p>
              Al enviar esta consulta aceptas que te contactemos para ofrecerte información sobre nuestros servicios.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;