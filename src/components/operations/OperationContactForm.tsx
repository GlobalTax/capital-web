import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, Building, Shield } from 'lucide-react';
import { useContactForm } from '@/hooks/useContactForm';
import { type OperationContactFormData } from '@/schemas/contactFormSchema';

interface OperationContactFormProps {
  operationId: string;
  companyName: string;
  className?: string;
}

const OperationContactForm: React.FC<OperationContactFormProps> = ({ 
  operationId, 
  companyName,
  className = '' 
}) => {
  const { submitOperationContactForm, isSubmitting } = useContactForm();
  const [formData, setFormData] = useState<OperationContactFormData>({
    fullName: '',
    company: '',
    companyName: companyName,
    email: '',
    phone: '',
    serviceType: 'vender' as const,
    message: `Estoy interesado en obtener más información sobre la oportunidad de ${companyName}.`,
    operationId: operationId,
    website: '', // Honeypot field
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📋 Operation contact form submitted for operation:', operationId);
    
    const result = await submitOperationContactForm(formData);
    
    if (result.success) {
      // Reset form on success but keep operation details
      setFormData({
        fullName: '',
        company: '',
        companyName: companyName,
        email: '',
        phone: '',
        serviceType: 'vender' as const,
        message: `Estoy interesado en obtener más información sobre la oportunidad de ${companyName}.`,
        operationId: operationId,
        website: '',
      });
    }
  };

  const handleInputChange = (field: keyof OperationContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: keyof OperationContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Building className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-bold text-foreground">
            Consulta sobre {companyName}
          </CardTitle>
        </div>
        <p className="text-muted-foreground">
          Completa este formulario para recibir más información sobre esta oportunidad de inversión
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot field - hidden from users */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website (do not fill):</label>
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

          {/* Required Fields */}
          <div className="space-y-4">
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
                />
              </div>
              
              <div>
                <Label htmlFor="company" className="text-sm font-medium">
                  Tu empresa *
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
                />
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono (opcional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+34 600 000 000"
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                Mensaje (opcional)
              </Label>
              <Textarea
                id="message"
                value={formData.message || ''}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Comparte detalles específicos sobre tu interés en esta oportunidad..."
                rows={4}
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando consulta...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Enviar Consulta sobre {companyName}
                </>
              )}
            </Button>
            
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <p>
                Información confidencial protegida bajo acuerdo de no divulgación
              </p>
            </div>
          </div>

          {/* Rate limit info */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Límite: 3 consultas de operación cada 30 minutos por dispositivo</p>
            <p>
              Al enviar esta consulta aceptas recibir información confidencial sobre esta oportunidad de inversión.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OperationContactForm;
