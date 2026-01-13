import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateMNABoutiquePerson, useUpdateMNABoutiquePerson } from '@/hooks/useMNABoutiquePeople';
import type { MNABoutiquePerson, MNABoutiquePersonFormData } from '@/types/mnaBoutique';
import { MNA_PERSON_ROLE_LABELS } from '@/types/mnaBoutique';

const formSchema = z.object({
  full_name: z.string().min(1, 'El nombre es requerido'),
  role: z.enum(['partner', 'managing_director', 'director', 'vp', 'associate', 'analyst', 'other']).optional().nullable(),
  title: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  linkedin_url: z.string().url('URL inválida').optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  is_primary_contact: z.boolean().default(false),
  notes: z.string().optional(),
});

interface MNAPersonFormProps {
  boutiqueId: string;
  person?: MNABoutiquePerson;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MNAPersonForm({ boutiqueId, person, onSuccess, onCancel }: MNAPersonFormProps) {
  const createMutation = useCreateMNABoutiquePerson();
  const updateMutation = useUpdateMNABoutiquePerson();
  const isEditing = !!person;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: person?.full_name || '',
      role: person?.role || null,
      title: person?.title || '',
      email: person?.email || '',
      linkedin_url: person?.linkedin_url || '',
      phone: person?.phone || '',
      location: person?.location || '',
      is_primary_contact: person?.is_primary_contact || false,
      notes: person?.notes || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const data: MNABoutiquePersonFormData = {
      boutique_id: boutiqueId,
      full_name: values.full_name,
      role: values.role || undefined,
      title: values.title || undefined,
      email: values.email || undefined,
      linkedin_url: values.linkedin_url || undefined,
      phone: values.phone || undefined,
      location: values.location || undefined,
      is_primary_contact: values.is_primary_contact,
      notes: values.notes || undefined,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: person.id, data });
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
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre y apellidos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(MNA_PERSON_ROLE_LABELS).map(([value, label]) => (
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Partner, Director..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+34..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <FormControl>
                  <Input placeholder="Madrid" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="linkedin_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn</FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/in/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_primary_contact"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Contacto principal</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Notas sobre esta persona..." 
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
