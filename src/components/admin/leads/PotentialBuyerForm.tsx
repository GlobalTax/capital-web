import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { LeadPotentialBuyer, LeadPotentialBuyerFormData, BUYER_STATUS_OPTIONS, REVENUE_RANGE_OPTIONS } from '@/types/leadPotentialBuyers';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  logo_url: z.string().min(1, 'El logo es requerido'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  description: z.string().optional(),
  sector_focus: z.array(z.string()).optional(),
  revenue_range: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  priority: z.number().optional(),
  status: z.enum(['identificado', 'contactado', 'interesado', 'negociando', 'descartado']).optional(),
  notes: z.string().optional(),
});

interface PotentialBuyerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyer?: LeadPotentialBuyer | null;
  onSubmit: (data: LeadPotentialBuyerFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const PotentialBuyerForm: React.FC<PotentialBuyerFormProps> = ({
  open,
  onOpenChange,
  buyer,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<LeadPotentialBuyerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: buyer?.name || '',
      logo_url: buyer?.logo_url || '',
      website: buyer?.website || '',
      description: buyer?.description || '',
      sector_focus: buyer?.sector_focus || [],
      revenue_range: buyer?.revenue_range || '',
      contact_name: buyer?.contact_name || '',
      contact_email: buyer?.contact_email || '',
      contact_phone: buyer?.contact_phone || '',
      priority: buyer?.priority || 0,
      status: buyer?.status || 'identificado',
      notes: buyer?.notes || '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: buyer?.name || '',
        logo_url: buyer?.logo_url || '',
        website: buyer?.website || '',
        description: buyer?.description || '',
        sector_focus: buyer?.sector_focus || [],
        revenue_range: buyer?.revenue_range || '',
        contact_name: buyer?.contact_name || '',
        contact_email: buyer?.contact_email || '',
        contact_phone: buyer?.contact_phone || '',
        priority: buyer?.priority || 0,
        status: buyer?.status || 'identificado',
        notes: buyer?.notes || '',
      });
    }
  }, [open, buyer, form]);

  const handleSubmit = async (data: LeadPotentialBuyerFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {buyer ? 'Editar Comprador' : 'Añadir Comprador Potencial'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Empresa ABC S.L." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Logo */}
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <ImageUploadField
                    label="Logo"
                    value={field.value}
                    onChange={field.onChange}
                    folder="potential-buyers/logos"
                    placeholder="URL del logo o sube una imagen"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio web</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Breve descripción del comprador..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Rango de Facturación */}
              <FormField
                control={form.control}
                name="revenue_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facturación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REVENUE_RANGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'identificado'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUYER_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Datos de Contacto */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">Datos de contacto</p>
              
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan García" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contacto@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="+34 600 000 000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buyer ? 'Guardar cambios' : 'Añadir comprador'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PotentialBuyerForm;
