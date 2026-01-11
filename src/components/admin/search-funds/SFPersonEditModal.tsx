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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SFPerson, SFPersonRole } from '@/types/searchFunds';
import { useCreateSFPerson, useUpdateSFPerson } from '@/hooks/useSFPeople';
import { useSFFunds } from '@/hooks/useSFFunds';
import { Loader2 } from 'lucide-react';

const personSchema = z.object({
  full_name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  linkedin_url: z.string().url('URL inválida').optional().or(z.literal('')),
  role: z.enum(['searcher', 'partner', 'principal', 'advisor'] as const),
  location: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  is_primary_contact: z.boolean().default(false),
  fund_id: z.string().min(1, 'Fund requerido'), // Fund es obligatorio por constraint NOT NULL en DB
});

type PersonFormData = z.infer<typeof personSchema>;

interface SFPersonEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: SFPerson | null;
  defaultFundId?: string;
}

const roleOptions: { value: SFPersonRole; label: string }[] = [
  { value: 'searcher', label: 'Searcher' },
  { value: 'partner', label: 'Partner' },
  { value: 'principal', label: 'Principal' },
  { value: 'advisor', label: 'Advisor' },
];

export const SFPersonEditModal: React.FC<SFPersonEditModalProps> = ({
  open,
  onOpenChange,
  person,
  defaultFundId,
}) => {
  const isEditing = !!person;
  const createPerson = useCreateSFPerson();
  const updatePerson = useUpdateSFPerson();
  const { data: funds = [] } = useSFFunds();

  const form = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      full_name: person?.full_name ?? '',
      email: person?.email ?? '',
      linkedin_url: person?.linkedin_url ?? '',
      role: person?.role ?? 'searcher',
      location: person?.location ?? '',
      phone: person?.phone ?? '',
      notes: person?.notes ?? '',
      is_primary_contact: person?.is_primary_contact ?? false,
      fund_id: person?.fund_id ?? defaultFundId ?? '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        full_name: person?.full_name ?? '',
        email: person?.email ?? '',
        linkedin_url: person?.linkedin_url ?? '',
        role: person?.role ?? 'searcher',
        location: person?.location ?? '',
        phone: person?.phone ?? '',
        notes: person?.notes ?? '',
        is_primary_contact: person?.is_primary_contact ?? false,
        fund_id: person?.fund_id ?? defaultFundId ?? '',
      });
    }
  }, [open, person, defaultFundId, form]);

  const onSubmit = async (data: PersonFormData) => {
    const payload = {
      full_name: data.full_name,
      email: data.email || null,
      linkedin_url: data.linkedin_url || null,
      role: data.role,
      location: data.location || null,
      phone: data.phone || null,
      notes: data.notes || null,
      is_primary_contact: data.is_primary_contact,
      fund_id: data.fund_id, // Siempre requerido
    };

    if (isEditing && person) {
      await updatePerson.mutateAsync({ id: person.id, ...payload });
    } else {
      await createPerson.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isSubmitting = createPerson.isPending || updatePerson.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Persona' : 'Nueva Persona'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nombre completo *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="john@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+34 600 000 000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((opt) => (
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Madrid, Spain" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://linkedin.com/in/..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fund_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Fund asociado *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un fund" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {funds.map((fund) => (
                          <SelectItem key={fund.id} value={fund.id}>
                            {fund.name}
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
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Notas internas..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_primary_contact"
                render={({ field }) => (
                  <FormItem className="col-span-2 flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Contacto principal del fund
                    </FormLabel>
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
                {isEditing ? 'Guardar cambios' : 'Crear persona'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SFPersonEditModal;
