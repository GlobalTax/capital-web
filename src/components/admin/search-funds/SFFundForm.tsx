import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import { SFFundTagEditor } from './SFFundTagEditor';
import { SFFundFormData, SFFundWithRelations, SFStatus, SFInvestmentStyle } from '@/types/searchFunds';
import { ApolloFundImporter, ApolloFundData } from '@/components/admin/shared/ApolloFundImporter';

const fundSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  website: z.string().url().nullable().or(z.literal('')),
  status: z.enum(['searching', 'acquired', 'holding', 'exited', 'inactive']),
  investment_style: z.enum(['single', 'buy_and_build', 'either']),
  country_base: z.string().nullable(),
  cities: z.array(z.string()).nullable(),
  geography_focus: z.array(z.string()).nullable(),
  sector_focus: z.array(z.string()).nullable(),
  sector_exclusions: z.array(z.string()).nullable(),
  founded_year: z.number().nullable(),
  description: z.string().nullable(),
  notes_internal: z.string().nullable(),
  source_url: z.string().nullable(),
  deal_size_min: z.number().nullable(),
  deal_size_max: z.number().nullable(),
  ebitda_min: z.number().nullable(),
  ebitda_max: z.number().nullable(),
  revenue_min: z.number().nullable(),
  revenue_max: z.number().nullable(),
});

type FormValues = z.infer<typeof fundSchema>;

interface SFFundFormProps {
  initialData?: SFFundWithRelations | null;
  onSubmit: (data: SFFundFormData) => Promise<void>;
  isSaving: boolean;
}

const statusOptions: { value: SFStatus; label: string }[] = [
  { value: 'searching', label: 'Buscando' },
  { value: 'acquired', label: 'Adquirido' },
  { value: 'holding', label: 'Holding' },
  { value: 'exited', label: 'Exit' },
  { value: 'inactive', label: 'Inactivo' },
];

const investmentStyleOptions: { value: SFInvestmentStyle; label: string }[] = [
  { value: 'single', label: 'Single acquisition' },
  { value: 'buy_and_build', label: 'Buy & Build' },
  { value: 'either', label: 'Cualquiera' },
];

export function SFFundForm({ initialData, onSubmit, isSaving }: SFFundFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(fundSchema),
    defaultValues: {
      name: initialData?.name || '',
      website: initialData?.website || '',
      status: initialData?.status || 'searching',
      investment_style: initialData?.investment_style || 'single',
      country_base: initialData?.country_base || '',
      cities: initialData?.cities || [],
      geography_focus: initialData?.geography_focus || [],
      sector_focus: initialData?.sector_focus || [],
      sector_exclusions: initialData?.sector_exclusions || [],
      founded_year: initialData?.founded_year || null,
      description: initialData?.description || '',
      notes_internal: initialData?.notes_internal || '',
      source_url: initialData?.source_url || '',
      deal_size_min: initialData?.deal_size_min || null,
      deal_size_max: initialData?.deal_size_max || null,
      ebitda_min: initialData?.ebitda_min || null,
      ebitda_max: initialData?.ebitda_max || null,
      revenue_min: initialData?.revenue_min || null,
      revenue_max: initialData?.revenue_max || null,
    },
  });

  const handleApolloImport = (data: ApolloFundData) => {
    form.reset({
      ...form.getValues(),
      name: data.name,
      website: data.website || '',
      source_url: data.source_url || '',
      description: data.description || '',
      country_base: data.country_base || '',
      cities: data.cities || [],
      founded_year: data.founded_year,
      sector_focus: data.sector_focus || [],
    });
  };

  const handleSubmit = async (values: FormValues) => {
    const data = {
      name: values.name,
      website: values.website || null,
      status: values.status,
      investment_style: values.investment_style,
      country_base: values.country_base || null,
      cities: values.cities || null,
      geography_focus: values.geography_focus || null,
      sector_focus: values.sector_focus || null,
      sector_exclusions: values.sector_exclusions || null,
      founded_year: values.founded_year,
      description: values.description || null,
      notes_internal: values.notes_internal || null,
      source_url: values.source_url || null,
      source_last_verified_at: initialData?.source_last_verified_at || null,
      searcher_lead_id: initialData?.searcher_lead_id || null,
      portfolio_url: initialData?.portfolio_url || null,
      last_portfolio_scraped_at: initialData?.last_portfolio_scraped_at || null,
      deal_size_min: values.deal_size_min,
      deal_size_max: values.deal_size_max,
      ebitda_min: values.ebitda_min,
      ebitda_max: values.ebitda_max,
      revenue_min: values.revenue_min,
      revenue_max: values.revenue_max,
    } satisfies SFFundFormData;
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Apollo Import - only show for new funds */}
        {!initialData && (
          <ApolloFundImporter onImport={handleApolloImport} disabled={isSaving} />
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del fund" {...field} />
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
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com" 
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
              name="founded_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año fundación</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="2020" 
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

            <FormField
              control={form.control}
              name="investment_style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo de inversión</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estilo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {investmentStyleOptions.map((opt) => (
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
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción del fund..." 
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="country_base"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País base</FormLabel>
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
              name="cities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudades</FormLabel>
                  <FormControl>
                    <SFFundTagEditor
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Añadir ciudad..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="geography_focus"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Foco geográfico</FormLabel>
                  <FormControl>
                    <SFFundTagEditor
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Añadir país/región..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Investment Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Criterios de Inversión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">EBITDA (€)</Label>
                <div className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name="ebitda_min"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Min"
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="text-muted-foreground">-</span>
                  <FormField
                    control={form.control}
                    name="ebitda_max"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Max"
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Revenue (€)</Label>
                <div className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name="revenue_min"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Min"
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="text-muted-foreground">-</span>
                  <FormField
                    control={form.control}
                    name="revenue_max"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Max"
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Deal Size (€)</Label>
                <div className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name="deal_size_min"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Min"
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="text-muted-foreground">-</span>
                  <FormField
                    control={form.control}
                    name="deal_size_max"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Max"
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sectors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sectores</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="sector_focus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sectores objetivo</FormLabel>
                  <FormControl>
                    <SFFundTagEditor
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Añadir sector..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sector_exclusions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sectores excluidos</FormLabel>
                  <FormControl>
                    <SFFundTagEditor
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Añadir sector excluido..."
                      variant="destructive"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas y Fuentes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="notes_internal"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Notas internas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas internas del equipo..." 
                      rows={3}
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
                <FormItem className="sm:col-span-2">
                  <FormLabel>URL fuente</FormLabel>
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
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
