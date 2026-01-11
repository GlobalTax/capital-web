import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { SFAcquisition, SFDealType, SFAcquisitionStatus } from '@/types/searchFunds';
import { useCreateSFAcquisition, useUpdateSFAcquisition } from '@/hooks/useSFAcquisitions';
import { Loader2 } from 'lucide-react';

const acquisitionSchema = z.object({
  company_name: z.string().min(1, 'Nombre de empresa requerido'),
  country: z.string().optional(),
  region: z.string().optional(),
  sector: z.string().optional(),
  cnae: z.string().optional(),
  description: z.string().optional(),
  deal_year: z.coerce.number().min(1900).max(2100).optional().or(z.literal('')),
  deal_type: z.enum(['majority', 'minority', 'merger', 'asset', 'unknown'] as const),
  status: z.enum(['owned', 'exited', 'unknown'] as const),
  exit_year: z.coerce.number().min(1900).max(2100).optional().or(z.literal('')),
  source_url: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
  fund_id: z.string().min(1, 'Fund requerido'),
});

type AcquisitionFormData = z.infer<typeof acquisitionSchema>;

interface SFAcquisitionEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acquisition?: SFAcquisition | null;
  defaultFundId?: string;
}

const dealTypeOptions: { value: SFDealType; label: string }[] = [
  { value: 'majority', label: 'Mayoría' },
  { value: 'minority', label: 'Minoría' },
  { value: 'merger', label: 'Fusión' },
  { value: 'asset', label: 'Compra de activos' },
  { value: 'unknown', label: 'Desconocido' },
];

const statusOptions: { value: SFAcquisitionStatus; label: string }[] = [
  { value: 'owned', label: 'En propiedad' },
  { value: 'exited', label: 'Desinvertida' },
  { value: 'unknown', label: 'Desconocido' },
];

export const SFAcquisitionEditModal: React.FC<SFAcquisitionEditModalProps> = ({
  open,
  onOpenChange,
  acquisition,
  defaultFundId,
}) => {
  const isEditing = !!acquisition;
  const createAcquisition = useCreateSFAcquisition();
  const updateAcquisition = useUpdateSFAcquisition();

  const form = useForm<AcquisitionFormData>({
    resolver: zodResolver(acquisitionSchema),
    defaultValues: {
      company_name: acquisition?.company_name ?? '',
      country: acquisition?.country ?? '',
      region: acquisition?.region ?? '',
      sector: acquisition?.sector ?? '',
      cnae: acquisition?.cnae ?? '',
      description: acquisition?.description ?? '',
      deal_year: acquisition?.deal_year ?? '',
      deal_type: acquisition?.deal_type ?? 'unknown',
      status: acquisition?.status ?? 'owned',
      exit_year: acquisition?.exit_year ?? '',
      source_url: acquisition?.source_url ?? '',
      notes: acquisition?.notes ?? '',
      fund_id: acquisition?.fund_id ?? defaultFundId ?? '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        company_name: acquisition?.company_name ?? '',
        country: acquisition?.country ?? '',
        region: acquisition?.region ?? '',
        sector: acquisition?.sector ?? '',
        cnae: acquisition?.cnae ?? '',
        description: acquisition?.description ?? '',
        deal_year: acquisition?.deal_year ?? '',
        deal_type: acquisition?.deal_type ?? 'unknown',
        status: acquisition?.status ?? 'owned',
        exit_year: acquisition?.exit_year ?? '',
        source_url: acquisition?.source_url ?? '',
        notes: acquisition?.notes ?? '',
        fund_id: acquisition?.fund_id ?? defaultFundId ?? '',
      });
    }
  }, [open, acquisition, defaultFundId, form]);

  const watchedStatus = form.watch('status');

  const onSubmit = async (data: AcquisitionFormData) => {
    const payload = {
      company_name: data.company_name,
      country: data.country || null,
      region: data.region || null,
      sector: data.sector || null,
      cnae: data.cnae || null,
      description: data.description || null,
      deal_year: data.deal_year ? Number(data.deal_year) : null,
      deal_type: data.deal_type,
      status: data.status,
      exit_year: data.status === 'exited' && data.exit_year ? Number(data.exit_year) : null,
      source_url: data.source_url || null,
      notes: data.notes || null,
      fund_id: data.fund_id,
    };

    if (isEditing && acquisition) {
      await updateAcquisition.mutateAsync({ id: acquisition.id, ...payload });
    } else {
      await createAcquisition.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isSubmitting = createAcquisition.isPending || updateAcquisition.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Adquisición' : 'Nueva Adquisición'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nombre de la empresa *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Empresa S.L." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="España" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Región</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Madrid" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tecnología" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnae"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNAE</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="6201" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deal_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año de adquisición</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="2023" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deal_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de operación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dealTypeOptions.map((opt) => (
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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((opt) => (
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

              {watchedStatus === 'exited' && (
                <FormField
                  control={form.control}
                  name="exit_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año de salida</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="2024" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="source_url"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>URL fuente</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Breve descripción..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notas internas</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Notas internas..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear adquisición'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SFAcquisitionEditModal;
