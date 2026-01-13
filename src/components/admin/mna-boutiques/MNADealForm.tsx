import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateMNABoutiqueDeal, useUpdateMNABoutiqueDeal } from '@/hooks/useMNABoutiqueDeals';
import type { MNABoutiqueDeal, MNABoutiqueDealFormData } from '@/types/mnaBoutique';
import { MNA_DEAL_TYPE_LABELS, MNA_ROLE_IN_DEAL_LABELS } from '@/types/mnaBoutique';

const formSchema = z.object({
  company_name: z.string().min(1, 'El nombre es requerido'),
  deal_type: z.enum(['sell_side', 'buy_side', 'capital_raise', 'due_diligence', 'valuation', 'restructuring', 'other']).optional().nullable(),
  deal_year: z.number().min(1990).max(2030).optional().nullable(),
  deal_value: z.number().min(0).optional().nullable(),
  deal_value_currency: z.string().default('EUR'),
  sector: z.string().optional(),
  country: z.string().optional(),
  acquirer_name: z.string().optional(),
  role_in_deal: z.enum(['advisor_seller', 'advisor_buyer', 'lead_advisor', 'co_advisor', 'valuation', 'dd_provider']).optional().nullable(),
  description: z.string().optional(),
  source_url: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
});

interface MNADealFormProps {
  boutiqueId: string;
  deal?: MNABoutiqueDeal;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MNADealForm({ boutiqueId, deal, onSuccess, onCancel }: MNADealFormProps) {
  const createMutation = useCreateMNABoutiqueDeal();
  const updateMutation = useUpdateMNABoutiqueDeal();
  const isEditing = !!deal;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: deal?.company_name || '',
      deal_type: deal?.deal_type || null,
      deal_year: deal?.deal_year || new Date().getFullYear(),
      deal_value: deal?.deal_value || null,
      deal_value_currency: deal?.deal_value_currency || 'EUR',
      sector: deal?.sector || '',
      country: deal?.country || 'Spain',
      acquirer_name: deal?.acquirer_name || '',
      role_in_deal: deal?.role_in_deal || null,
      description: deal?.description || '',
      source_url: deal?.source_url || '',
      notes: deal?.notes || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const data: MNABoutiqueDealFormData = {
      boutique_id: boutiqueId,
      company_name: values.company_name,
      deal_type: values.deal_type || undefined,
      deal_year: values.deal_year || undefined,
      deal_value: values.deal_value || undefined,
      deal_value_currency: values.deal_value_currency,
      sector: values.sector || undefined,
      country: values.country || undefined,
      acquirer_name: values.acquirer_name || undefined,
      role_in_deal: values.role_in_deal || undefined,
      description: values.description || undefined,
      source_url: values.source_url || undefined,
      notes: values.notes || undefined,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: deal.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la empresa" {...field} />
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
                <FormLabel>Tipo de deal</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(MNA_DEAL_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role_in_deal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol en el deal</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(MNA_ROLE_IN_DEAL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
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
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
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
                  <Input placeholder="Spain" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sector</FormLabel>
                <FormControl>
                  <Input placeholder="Tecnología, Salud..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acquirer_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comprador</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del comprador" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="source_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL fuente</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
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
                  className="min-h-[60px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : isEditing ? 'Guardar' : 'Añadir'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
