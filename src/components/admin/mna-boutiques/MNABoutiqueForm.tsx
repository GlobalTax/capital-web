import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateMNABoutique, useUpdateMNABoutique } from '@/hooks/useMNABoutiques';
import type { MNABoutique, MNABoutiqueFormData } from '@/types/mnaBoutique';
import { MNA_BOUTIQUE_STATUS_LABELS, MNA_TIER_LABELS, MNA_SPECIALIZATION_LABELS } from '@/types/mnaBoutique';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  linkedin_url: z.string().url('URL inválida').optional().or(z.literal('')),
  country_base: z.string().optional(),
  founded_year: z.number().min(1900).max(2030).optional().nullable(),
  employee_count: z.number().min(0).optional().nullable(),
  employee_count_source: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'acquired', 'closed']).optional(),
  tier: z.enum(['tier_1', 'tier_2', 'tier_3', 'regional', 'specialist']).optional().nullable(),
  deal_size_min: z.number().min(0).optional().nullable(),
  deal_size_max: z.number().min(0).optional().nullable(),
  notes_internal: z.string().optional(),
});

interface MNABoutiqueFormProps {
  boutique?: MNABoutique;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MNABoutiqueForm({ boutique, onSuccess, onCancel }: MNABoutiqueFormProps) {
  const createMutation = useCreateMNABoutique();
  const updateMutation = useUpdateMNABoutique();
  const isEditing = !!boutique;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: boutique?.name || '',
      website: boutique?.website || '',
      linkedin_url: boutique?.linkedin_url || '',
      country_base: boutique?.country_base || 'Spain',
      founded_year: boutique?.founded_year || null,
      employee_count: boutique?.employee_count || null,
      employee_count_source: boutique?.employee_count_source || '',
      description: boutique?.description || '',
      status: boutique?.status || 'active',
      tier: boutique?.tier || null,
      deal_size_min: boutique?.deal_size_min || null,
      deal_size_max: boutique?.deal_size_max || null,
      notes_internal: boutique?.notes_internal || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const data: MNABoutiqueFormData = {
      name: values.name,
      website: values.website || undefined,
      linkedin_url: values.linkedin_url || undefined,
      country_base: values.country_base,
      founded_year: values.founded_year || undefined,
      employee_count: values.employee_count || undefined,
      employee_count_source: values.employee_count_source || undefined,
      description: values.description || undefined,
      status: values.status,
      tier: values.tier || undefined,
      deal_size_min: values.deal_size_min || undefined,
      deal_size_max: values.deal_size_max || undefined,
      notes_internal: values.notes_internal || undefined,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: boutique.id, data });
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la boutique" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country_base"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País sede</FormLabel>
                <FormControl>
                  <Input placeholder="Spain" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitio web</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedin_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/company/..." {...field} />
                </FormControl>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(MNA_BOUTIQUE_STATUS_LABELS).map(([value, label]) => (
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
            name="tier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tier</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(MNA_TIER_LABELS).map(([value, label]) => (
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
            name="founded_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año fundación</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="2010" 
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
            name="employee_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº empleados</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="25" 
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
            name="deal_size_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deal size mín (M€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="5" 
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
            name="deal_size_max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deal size máx (M€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="100" 
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción de la boutique..." 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes_internal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas internas</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Notas privadas sobre esta boutique..." 
                  className="min-h-[60px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear boutique'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
