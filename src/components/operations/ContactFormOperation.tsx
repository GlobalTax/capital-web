import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useOperationContactForm } from '@/hooks/useOperationContactForm';
import { Loader2 } from 'lucide-react';

interface ContactFormOperationProps {
  operationId: string;
  companyName: string;
}

const ContactFormOperation: React.FC<ContactFormOperationProps> = ({ 
  operationId, 
  companyName 
}) => {
  const { submitOperationContactForm, isSubmitting } = useOperationContactForm();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Estoy interesado en obtener más información sobre la oportunidad de ${companyName}.`
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await submitOperationContactForm({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      operationId,
      companyName
    });

    if (result.success) {
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: `Estoy interesado en obtener más información sobre la oportunidad de ${companyName}.`
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Tu nombre"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="tu@email.com"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+34 600 000 000"
          />
        </div>
        
        <div>
          <Label htmlFor="message">Mensaje</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Cuéntanos más sobre tu interés..."
            rows={4}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar Consulta'
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContactFormOperation;