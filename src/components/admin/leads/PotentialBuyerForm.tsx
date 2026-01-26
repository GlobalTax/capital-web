import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ImageUploadField from '@/components/admin/ImageUploadField';
import BuyerQuickSearch, { EnrichmentData } from './BuyerQuickSearch';
import { LeadPotentialBuyer, LeadPotentialBuyerFormData, BUYER_STATUS_OPTIONS, REVENUE_RANGE_OPTIONS } from '@/types/leadPotentialBuyers';
import { Loader2, Sparkles } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  logo_url: z.string().optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  description: z.string().optional(),
  sector_focus: z.array(z.string()).optional(),
  revenue_range: z.string().optional(),
  revenue: z.number().optional(),
  ebitda: z.number().optional(),
  employees: z.number().int().optional(),
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
  const [showManualForm, setShowManualForm] = useState(false);
  const [isEnriched, setIsEnriched] = useState(false);

  const form = useForm<LeadPotentialBuyerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: buyer?.name || '',
      logo_url: buyer?.logo_url || '',
      website: buyer?.website || '',
      description: buyer?.description || '',
      sector_focus: buyer?.sector_focus || [],
      revenue_range: buyer?.revenue_range || '',
      revenue: buyer?.revenue || undefined,
      ebitda: buyer?.ebitda || undefined,
      employees: buyer?.employees || undefined,
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
      const isEditing = !!buyer;
      setShowManualForm(isEditing);
      setIsEnriched(false);
      form.reset({
        name: buyer?.name || '',
        logo_url: buyer?.logo_url || '',
        website: buyer?.website || '',
        description: buyer?.description || '',
        sector_focus: buyer?.sector_focus || [],
        revenue_range: buyer?.revenue_range || '',
        revenue: buyer?.revenue || undefined,
        ebitda: buyer?.ebitda || undefined,
        employees: buyer?.employees || undefined,
        contact_name: buyer?.contact_name || '',
        contact_email: buyer?.contact_email || '',
        contact_phone: buyer?.contact_phone || '',
        priority: buyer?.priority || 0,
        status: buyer?.status || 'identificado',
        notes: buyer?.notes || '',
      });
    }
  }, [open, buyer, form]);

  const handleEnrichData = (data: EnrichmentData) => {
    form.setValue('name', data.name);
    if (data.logo_url) form.setValue('logo_url', data.logo_url);
    if (data.website) form.setValue('website', data.website);
    if (data.description) form.setValue('description', data.description);
    if (data.sector_focus.length > 0) form.setValue('sector_focus', data.sector_focus);
    if (data.revenue_range) form.setValue('revenue_range', data.revenue_range);
    if (data.revenue) form.setValue('revenue', data.revenue);
    if (data.ebitda) form.setValue('ebitda', data.ebitda);
    if (data.employees) form.setValue('employees', data.employees);
    
    setIsEnriched(true);
    setShowManualForm(true);
  };

  const handleManualEdit = () => {
    setShowManualForm(true);
  };

  const handleSubmit = async (data: LeadPotentialBuyerFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  const isEditing = !!buyer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {buyer ? 'Editar Comprador' : 'Añadir Comprador Potencial'}
            {isEnriched && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                IA
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* AI Search Section - Only show when creating new */}
        {!isEditing && !showManualForm && (
          <BuyerQuickSearch
            onUseData={handleEnrichData}
            onManualEdit={handleManualEdit}
          />
        )}

        {/* Separator when showing search */}
        {!isEditing && !showManualForm && (
          <div className="relative py-2">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              O rellena manualmente
            </span>
          </div>
        )}

        {/* Manual Form */}
        {(showManualForm || isEditing) && (
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
                      placeholder="URL del logo o sube una imagen (opcional)"
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

              {/* Datos Financieros */}
              <div className="space-y-3 pt-2 border-t">
                <p className="text-sm font-medium text-muted-foreground">Datos Financieros</p>
                
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="revenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facturación €</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="1500000"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ebitda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EBITDA €</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="250000"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empleados</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="45"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Rango de Facturación */}
                  <FormField
                    control={form.control}
                    name="revenue_range"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rango Facturación</FormLabel>
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
        )}

        {/* Show manual form button when search is visible */}
        {!isEditing && !showManualForm && (
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={handleManualEdit}
          >
            Rellenar formulario manualmente
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PotentialBuyerForm;
