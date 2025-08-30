import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send } from 'lucide-react';

interface FormData {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  sectorsOfInterest: string[];
  operationType: string;
}

const sectors = [
  'Tecnología',
  'Industrial',
  'Servicios',
  'Retail',
  'Healthcare',
  'Real Estate',
  'Alimentación',
  'Automotive',
  'Otros'
];

const operationTypes = [
  'Compra estratégica',
  'Venta de empresa',
  'Inversión financiera',
  'Joint Venture',
  'Management Buyout',
  'Sucesión familiar'
];

export const MAResourcesForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    sectorsOfInterest: [],
    operationType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSectorToggle = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      sectorsOfInterest: prev.sectorsOfInterest.includes(sector)
        ? prev.sectorsOfInterest.filter(s => s !== sector)
        : [...prev.sectorsOfInterest, sector]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.company || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('ma_resources_requests')
        .insert({
          full_name: formData.fullName,
          company: formData.company,
          email: formData.email,
          phone: formData.phone || null,
          sectors_of_interest: formData.sectorsOfInterest.length > 0 ? formData.sectorsOfInterest : null,
          operation_type: formData.operationType || null,
          ip_address: null, // Will be set by RLS policy
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "¡Solicitud enviada!",
        description: "Te contactaremos pronto con los recursos solicitados.",
        variant: "default"
      });

      // Reset form
      setFormData({
        fullName: '',
        company: '',
        email: '',
        phone: '',
        sectorsOfInterest: [],
        operationType: ''
      });

    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu solicitud. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          Solicitar Consultoría Personalizada
        </CardTitle>
        <p className="text-muted-foreground">
          ¿Prefieres una consultoría con nuestro equipo? Completa el formulario y te contactaremos.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Empresa *</Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Nombre de la empresa"
                required
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="tu@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+34 XXX XXX XXX"
              />
            </div>
          </div>

          {/* Sectors of Interest */}
          <div className="space-y-3">
            <Label>Sectores de interés</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {sectors.map((sector) => (
                <div key={sector} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sector-${sector}`}
                    checked={formData.sectorsOfInterest.includes(sector)}
                    onCheckedChange={() => handleSectorToggle(sector)}
                  />
                  <Label 
                    htmlFor={`sector-${sector}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {sector}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Operation Type */}
          <div className="space-y-3">
            <Label>Tipo de operación</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {operationTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`operation-${type}`}
                    checked={formData.operationType === type}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        operationType: checked ? type : '' 
                      }));
                    }}
                  />
                  <Label 
                    htmlFor={`operation-${type}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Solicitar Consultoría
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};