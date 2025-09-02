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
  pageOrigin = 'contact_page', 
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
    console.log('📝 ContactForm: Form submitted', { 
      pageOrigin, 
      requiredFieldsComplete: !!(formData.fullName && formData.company && formData.email),
      timestamp: new Date().toISOString()
    });
    
    const result = await submitContactForm(formData, pageOrigin);
    
    if (result.success) {
      console.log('✅ ContactForm: Submission successful, clearing form');
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
      console.error('❌ ContactForm: Submission failed:', result.error);
    }
  };

  const updateField = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={`w-full max-w-xl mx-auto ${className}`}>
      {showTitle && (
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-xl font-semibold text-foreground">
            Consulta Gratuita
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Te contactaremos para una valoración preliminar
          </p>
        </CardHeader>
      )}
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot - invisible to users and screen readers */}
          <div className="hidden" aria-hidden="true">
            <input
              name="website"
              type="text"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Required Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Nombre completo *
              </Label>
              <Input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="Tu nombre y apellidos"
                disabled={isSubmitting}
                aria-describedby="fullName-hint"
                className="mt-1"
              />
              <p id="fullName-hint" className="text-xs text-muted-foreground mt-1">
                Mínimo 2 caracteres
              </p>
            </div>

            <div>
              <Label htmlFor="company" className="text-sm font-medium text-foreground">
                Empresa *
              </Label>
              <Input
                id="company"
                type="text"
                required
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder="Nombre de la empresa"
                disabled={isSubmitting}
                aria-describedby="company-hint"
                className="mt-1"
              />
              <p id="company-hint" className="text-xs text-muted-foreground mt-1">
                Tu empresa o proyecto
              </p>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="tu@email.com"
                disabled={isSubmitting}
                aria-describedby="email-hint"
                className="mt-1"
              />
              <p id="email-hint" className="text-xs text-muted-foreground mt-1">
                Email de contacto
              </p>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+34 600 000 000"
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="country" className="text-sm font-medium text-foreground">
                  País
                </Label>
                <Select 
                  value={formData.country || ''} 
                  onValueChange={(value) => updateField('country', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar" />
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companySize" className="text-sm font-medium text-foreground">
                  Tamaño empresa
                </Label>
                <Select 
                  value={formData.companySize || ''} 
                  onValueChange={(value) => updateField('companySize', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Ingresos anuales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menos_100k">&lt; €100K</SelectItem>
                    <SelectItem value="100k_500k">€100K - €500K</SelectItem>
                    <SelectItem value="500k_1m">€500K - €1M</SelectItem>
                    <SelectItem value="1m_5m">€1M - €5M</SelectItem>
                    <SelectItem value="5m_20m">€5M - €20M</SelectItem>
                    <SelectItem value="mas_20m">&gt; €20M</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="referral" className="text-sm font-medium text-foreground">
                  ¿Cómo nos conociste?
                </Label>
                <Select 
                  value={formData.referral || ''} 
                  onValueChange={(value) => updateField('referral', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referencia">Referencia</SelectItem>
                    <SelectItem value="prensa">Prensa</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="redes_sociales">Redes sociales</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-foreground">
                Mensaje (opcional)
              </Label>
              <Textarea
                id="message"
                value={formData.message || ''}
                onChange={(e) => updateField('message', e.target.value)}
                placeholder="Información adicional sobre tu empresa..."
                rows={3}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Consulta
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-3 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <Shield className="h-3 w-3" />
              <span>Datos protegidos y confidenciales</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Máximo 5 consultas cada 10 minutos • 
              Al enviar aceptas recibir información de nuestros servicios
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;