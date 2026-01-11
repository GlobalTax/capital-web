import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateCRDeal, useUpdateCRDeal } from '@/hooks/useCRDeals';
import { CRDeal, CRDealFormData, CR_DEAL_TYPE_LABELS } from '@/types/capitalRiesgo';

const dealSchema = z.object({
  company_name: z.string().min(1, 'El nombre es requerido'),
  deal_type: z.enum(['acquisition', 'add_on', 'exit', 'recap', 'follow_on', 'ipo', 'merger']).nullable(),
  deal_year: z.number().nullable(),
  deal_value: z.number().nullable(),
  sector: z.string().nullable(),
  country: z.string().nullable(),
  description: z.string().nullable(),
  source_url: z.string().nullable(),
  notes: z.string().nullable(),
});

type FormValues = z.infer<typeof dealSchema>;

interface CRDealEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: CRDeal | null;
  defaultFundId?: string;
}

export function CRDealEditModal({
  open,
  onOpenChange,
  deal,
  defaultFundId,
}: CRDealEditModalProps) {
  const createMutation = useCreateCRDeal();
  const updateMutation = useUpdateCRDeal();
  const isEditing = !!deal;

  const form = useForm<FormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      company_name: '',
      deal_type: null,
      deal_year: null,
      deal_value: null,
      sector: '',
      country: '',
      description: '',
      source_url: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (deal) {
      form.reset({
        company_name: deal.company_name || '',
        deal_type: deal.deal_type || null,
        deal_year: deal.deal_year || null,
        deal_value: deal.deal_value || null,
        sector: deal.sector || '',
        country: deal.country || '',
        description: deal.description || '',
        source_url: deal.source_url || '',
        notes: deal.notes || '',
      });
    } else {
      form.reset({
        company_name: '',
        deal_type: null,
        deal_year: new Date().getFullYear(),
        deal_value: null,
        sector: '',
        country: '',
        description: '',
        source_url: '',
        notes: '',
      });
    }
  }, [deal, form]);

  const handleSubmit = async (values: FormValues) => {
    const fundId = deal?.fund_id || defaultFundId;
    if (!fundId) return;

    const data: CRDealFormData = {
      fund_id: fundId,
      portfolio_id: deal?.portfolio_id || null,
      company_name: values.company_name,
      deal_type: values.deal_type,
      deal_year: values.deal_year,
      deal_value: values.deal_value,
      sector: values.sector || null,
      country: values.country || null,
      description: values.description || null,
      source_url: values.source_url || null,
      notes: values.notes || null,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: deal.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }

    onOpenChange(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Deal' : 'Nuevo Deal'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Empresa S.L." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deal_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Deal</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CR_DEAL_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                name="deal_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="2024"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deal_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="10000000"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
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
                      <Input 
                        placeholder="Tecnología"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="España"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción del deal..."
                      rows={2}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Fuente</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas internas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas..."
                      rows={2}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  isEditing ? 'Actualizar' : 'Crear'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CRDealEditModal;
