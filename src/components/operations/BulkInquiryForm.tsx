import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, CheckCircle2, Loader2, Building2 } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  full_name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company_name: z.string().min(2, 'Empresa requerida'),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const BulkInquiryForm: React.FC = () => {
  const { wishlist, isBulkInquiryOpen, closeBulkInquiry, clearWishlist } = useWishlist();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = formSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof FormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Edge function handles both DB insert and email notifications
      const { data, error } = await supabase.functions.invoke('send-bulk-inquiry-notification', {
        body: {
          ...formData,
          operations: wishlist.map(op => ({
            id: op.id,
            company_name: op.company_name,
            sector: op.sector,
            ebitda_amount: op.ebitda_amount,
            valuation_currency: op.valuation_currency,
          })),
        },
      });

      if (error) throw error;

      setIsSuccess(true);
      
      // Clear wishlist after successful submission
      setTimeout(() => {
        clearWishlist();
        closeBulkInquiry();
        setIsSuccess(false);
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          company_name: '',
          message: '',
        });
      }, 3000);

    } catch (error) {
      console.error('Error submitting bulk inquiry:', error);
      toast.error('Error al enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      closeBulkInquiry();
      setIsSuccess(false);
    }
  };

  return (
    <Dialog open={isBulkInquiryOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              ¡Solicitud enviada!
            </h3>
            <p className="text-muted-foreground">
              Hemos recibido tu solicitud de información para {wishlist.length} operaciones.
              <br />
              Nos pondremos en contacto contigo en las próximas 24-48h.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Solicitar Información
              </DialogTitle>
              <DialogDescription>
                Completa tus datos para recibir información detallada de las operaciones seleccionadas.
              </DialogDescription>
            </DialogHeader>

            {/* Selected Operations */}
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium mb-2">
                Operaciones seleccionadas ({wishlist.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {wishlist.map((op) => (
                  <Badge key={op.id} variant="secondary" className="py-1">
                    <Building2 className="h-3 w-3 mr-1" />
                    {op.company_name}
                  </Badge>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Nombre completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className={errors.full_name ? 'border-destructive' : ''}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive">{errors.full_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">
                    Tu empresa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Nombre de tu empresa"
                    className={errors.company_name ? 'border-destructive' : ''}
                  />
                  {errors.company_name && (
                    <p className="text-xs text-destructive">{errors.company_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje (opcional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Cuéntanos más sobre tu interés en estas operaciones..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || wishlist.length === 0}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar solicitud
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
