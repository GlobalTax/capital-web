import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, CheckCircle } from 'lucide-react';

interface ContactFormOperationProps {
  operationId: string;
  companyName: string;
}

const ContactFormOperation: React.FC<ContactFormOperationProps> = ({ 
  operationId, 
  companyName 
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    investmentRange: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_leads')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company,
          referral: `Operación: ${companyName} (ID: ${operationId})`,
          status: 'new'
        });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "Solicitud enviada",
        description: "Te contactaremos en las próximas 24 horas con la información solicitada.",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡Solicitud Recibida!
        </h3>
        <p className="text-sm text-gray-600">
          Te contactaremos pronto con la información detallada de esta oportunidad.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Nombre completo *</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="company">Empresa/Fondo *</Label>
        <Input
          id="company"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleInputChange}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="investmentRange">Rango de inversión</Label>
        <Input
          id="investmentRange"
          name="investmentRange"
          type="text"
          value={formData.investmentRange}
          onChange={handleInputChange}
          placeholder="ej. 1-5M€"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="message">Mensaje adicional</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          rows={3}
          className="mt-1"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Solicitar Información
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Al enviar este formulario aceptas que contactemos contigo sobre esta oportunidad.
      </p>
    </form>
  );
};

export default ContactFormOperation;