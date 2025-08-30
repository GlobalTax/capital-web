import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send } from 'lucide-react';

interface LegalLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LegalLeadModal: React.FC<LegalLeadModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    email: '',
    phone: '',
    sector: '',
    company_size: '',
    consultation_type: 'asesoramiento-legal',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('legal_leads')
        .insert([{
          ...formData,
          ip_address: '0.0.0.0', // Will be set by database
          user_agent: navigator.userAgent,
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          referrer: document.referrer
        }]);

      if (error) throw error;

      toast.success('Solicitud enviada correctamente', {
        description: 'Nos pondremos en contacto contigo en las próximas 24 horas.',
      });

      // Reset form
      setFormData({
        full_name: '',
        company: '',
        email: '',
        phone: '',
        sector: '',
        company_size: '',
        consultation_type: 'asesoramiento-legal',
        message: ''
      });

      onClose();
    } catch (error) {
      console.error('Error submitting legal lead:', error);
      toast.error('Error al enviar la solicitud', {
        description: 'Por favor, inténtalo de nuevo más tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Propuesta
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Completa el formulario y te contactaremos para discutir tus necesidades legales específicas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo *</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Tu nombre"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa *</Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Nombre de empresa"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@empresa.com"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+34 600 000 000"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnologia">Tecnología</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="servicios">Servicios</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="fintech">Fintech</SelectItem>
                  <SelectItem value="energia">Energía</SelectItem>
                  <SelectItem value="inmobiliario">Inmobiliario</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_size">Tamaño empresa</Label>
              <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup (&lt;€1M)</SelectItem>
                  <SelectItem value="small">Pequeña (€1-10M)</SelectItem>
                  <SelectItem value="medium">Mediana (€10-50M)</SelectItem>
                  <SelectItem value="large">Grande (€50-200M)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (&gt;€200M)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Describe tu necesidad legal</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Cuéntanos sobre la operación M&A, timeline, aspectos legales específicos que te preocupan..."
              className="min-h-[80px]"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Propuesta
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            Al enviar este formulario, aceptas que Capittal se ponga en contacto contigo para discutir tus necesidades legales.
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LegalLeadModal;