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
import { CRFundTagEditor } from './CRFundTagEditor';
import { 
  CRFundFormData, 
  CRFundWithRelations,
  CR_FUND_STATUS_LABELS,
  CR_FUND_TYPE_LABELS,
  CR_INVESTMENT_STAGE_LABELS,
} from '@/types/capitalRiesgo';

const fundSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  website: z.string().url().nullable().or(z.literal('')),
  fund_type: z.enum(['private_equity', 'venture_capital', 'growth_equity', 'family_office', 'corporate', 'fund_of_funds']).nullable(),
  status: z.enum(['active', 'raising', 'deployed', 'closed', 'inactive']).nullable(),
  country_base: z.string().nullable(),
  cities: z.array(z.string()).nullable(),
  founded_year: z.number().nullable(),
  description: z.string().nullable(),
  aum: z.number().nullable(),
  current_fund_number: z.number().nullable(),
  current_fund_size: z.number().nullable(),
  investment_stage: z.array(z.enum(['seed', 'series_a', 'series_b', 'series_c', 'growth', 'buyout', 'turnaround', 'special_situations'])).nullable(),
  geography_focus: z.array(z.string()).nullable(),
  sector_focus: z.array(z.string()).nullable(),
  sector_exclusions: z.array(z.string()).nullable(),
  deal_types: z.array(z.string()).nullable(),
  ticket_min: z.number().nullable(),
  ticket_max: z.number().nullable(),
  ebitda_min: z.number().nullable(),
  ebitda_max: z.number().nullable(),
  revenue_min: z.number().nullable(),
  revenue_max: z.number().nullable(),
  notes_internal: z.string().nullable(),
  source_url: z.string().nullable(),
});

type FormValues = z.infer<typeof fundSchema>;

interface CRFundFormProps {
  initialData?: CRFundWithRelations | null;
  onSubmit: (data: CRFundFormData) => Promise<void>;
  isSaving: boolean;
}

export function CRFundForm({ initialData, onSubmit, isSaving }: CRFundFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(fundSchema),
    defaultValues: {
      name: initialData?.name || '',
      website: initialData?.website || '',
      fund_type: initialData?.fund_type || null,
      status: initialData?.status || 'active',
      country_base: initialData?.country_base || '',
      cities: initialData?.cities || [],
      founded_year: initialData?.founded_year || null,
      description: initialData?.description || '',
      aum: initialData?.aum || null,
      current_fund_number: initialData?.current_fund_number || null,
      current_fund_size: initialData?.current_fund_size || null,
      investment_stage: initialData?.investment_stage || [],
      geography_focus: initialData?.geography_focus || [],
      sector_focus: initialData?.sector_focus || [],
      sector_exclusions: initialData?.sector_exclusions || [],
      deal_types: initialData?.deal_types || [],
      ticket_min: initialData?.ticket_min || null,
      ticket_max: initialData?.ticket_max || null,
      ebitda_min: initialData?.ebitda_min || null,
      ebitda_max: initialData?.ebitda_max || null,
      revenue_min: initialData?.revenue_min || null,
      revenue_max: initialData?.revenue_max || null,
      notes_internal: initialData?.notes_internal || '',
      source_url: initialData?.source_url || '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    const data: CRFundFormData = {
      name: values.name,
      website: values.website || null,
      fund_type: values.fund_type,
      status: values.status,
      country_base: values.country_base || null,
      cities: values.cities || null,
      founded_year: values.founded_year,
      description: values.description || null,
      aum: values.aum,
      current_fund_number: values.current_fund_number,
      current_fund_size: values.current_fund_size,
      investment_stage: values.investment_stage || null,
      geography_focus: values.geography_focus || null,
      sector_focus: values.sector_focus || null,
      sector_exclusions: values.sector_exclusions || null,
      deal_types: values.deal_types || null,
      ticket_min: values.ticket_min,
      ticket_max: values.ticket_max,
      ebitda_min: values.ebitda_min,
      ebitda_max: values.ebitda_max,
      revenue_min: values.revenue_min,
      revenue_max: values.revenue_max,
      notes_internal: values.notes_internal || null,
      source_url: values.source_url || null,
      source_last_verified_at: initialData?.source_last_verified_at || null,
    };
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                    <Input placeholder="Nombre del fondo" {...field} />
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
                      placeholder="2010" 
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
              name="fund_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Fondo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CR_FUND_TYPE_LABELS).map(([value, label]) => (
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CR_FUND_STATUS_LABELS).map(([value, label]) => (
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
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción del fondo..." 
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
                    <CRFundTagEditor
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
                    <CRFundTagEditor
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

        {/* AUM & Fund Size */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AUM y Tamaño de Fondo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="aum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AUM Total (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="500000000" 
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
              name="current_fund_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº Fondo Actual</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="3" 
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
              name="current_fund_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamaño Fondo Actual (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="150000000" 
                      {...field}
                      value={field.value || ''}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
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
            <FormField
              control={form.control}
              name="investment_stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etapa de Inversión</FormLabel>
                  <FormControl>
                    <CRFundTagEditor
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Seed, Growth, Buyout..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deal_types"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipos de Deal</FormLabel>
                  <FormControl>
                    <CRFundTagEditor
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Mayoría, Minoría, Growth..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Ticket (€)</Label>
                <div className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name="ticket_min"
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
                    name="ticket_max"
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
                    <CRFundTagEditor
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
                    <CRFundTagEditor
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Añadir exclusión..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Internal Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas Internas</CardTitle>
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
                      placeholder="Notas internas sobre el fondo..." 
                      rows={4}
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

export default CRFundForm;
