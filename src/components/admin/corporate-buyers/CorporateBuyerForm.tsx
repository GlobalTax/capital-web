// =============================================
// CORPORATE BUYER CREATION/EDIT FORM
// Full form with validation and profile import
// =============================================

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Building2, Target, DollarSign, FileText, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { ProfileImporter } from './ProfileImporter';
import { SectorMultiSelect } from './SectorMultiSelect';
import { 
  CorporateBuyerType, 
  BUYER_TYPE_LABELS,
  CorporateBuyerFormData 
} from '@/types/corporateBuyers';
import { parseNumberWithDots, formatNumberWithDots } from '@/utils/numberFormatting';

// Countries list for Spain-focused M&A
const COUNTRIES = [
  'España', 'Portugal', 'Francia', 'Alemania', 'Italia', 'Reino Unido',
  'Países Bajos', 'Bélgica', 'Suiza', 'Austria', 'Polonia', 'Estados Unidos',
  'México', 'Colombia', 'Chile', 'Argentina', 'Brasil', 'China', 'Japón', 'Otros'
];

// Validation schema
const corporateBuyerSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido (mín. 2 caracteres)'),
  buyer_type: z.enum(['corporate', 'family_office', 'pe_fund', 'strategic_buyer', 'holding']).nullable(),
  website: z.string().url('URL no válida').optional().or(z.literal('')),
  country_base: z.string().nullable(),
  cities: z.array(z.string()).nullable(),
  description: z.string().max(2000, 'Máximo 2000 caracteres').nullable(),
  investment_thesis: z.string().nullable(),
  sector_focus: z.array(z.string()).nullable(),
  sector_exclusions: z.array(z.string()).nullable(),
  geography_focus: z.array(z.string()).nullable(),
  search_keywords: z.array(z.string()).nullable(),
  revenue_min: z.number().nullable(),
  revenue_max: z.number().nullable(),
  ebitda_min: z.number().nullable(),
  ebitda_max: z.number().nullable(),
  deal_size_min: z.number().nullable(),
  deal_size_max: z.number().nullable(),
  source_url: z.string().url('URL no válida').optional().or(z.literal('')),
  notes_internal: z.string().nullable(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof corporateBuyerSchema>;

interface CorporateBuyerFormProps {
  onSubmit: (data: CorporateBuyerFormData) => Promise<void>;
  isSaving?: boolean;
  initialData?: Partial<CorporateBuyerFormData>;
}

export function CorporateBuyerForm({ onSubmit, isSaving = false, initialData }: CorporateBuyerFormProps) {
  const [isEditingSectors, setIsEditingSectors] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [geoInput, setGeoInput] = useState('');
  const [exclusionInput, setExclusionInput] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(corporateBuyerSchema),
    defaultValues: {
      name: '',
      buyer_type: null,
      website: '',
      country_base: null,
      cities: [],
      description: '',
      investment_thesis: '',
      sector_focus: [],
      sector_exclusions: [],
      geography_focus: [],
      search_keywords: [],
      revenue_min: null,
      revenue_max: null,
      ebitda_min: null,
      ebitda_max: null,
      deal_size_min: null,
      deal_size_max: null,
      source_url: '',
      notes_internal: '',
      is_active: true,
      ...initialData,
    },
  });

  // Handle profile import data
  const handleProfileImport = (data: Partial<CorporateBuyerFormData>) => {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.setValue(key as keyof FormValues, value as any);
      }
    });
  };

  const handleSubmit = async (values: FormValues) => {
    // Clean up empty strings to null
    const cleanedData: CorporateBuyerFormData = {
      name: values.name,
      buyer_type: values.buyer_type || undefined,
      website: values.website || undefined,
      country_base: values.country_base || undefined,
      cities: values.cities?.length ? values.cities : undefined,
      description: values.description || undefined,
      investment_thesis: values.investment_thesis || undefined,
      sector_focus: values.sector_focus?.length ? values.sector_focus : undefined,
      sector_exclusions: values.sector_exclusions?.length ? values.sector_exclusions : undefined,
      geography_focus: values.geography_focus?.length ? values.geography_focus : undefined,
      search_keywords: values.search_keywords?.length ? values.search_keywords : undefined,
      revenue_min: values.revenue_min ?? undefined,
      revenue_max: values.revenue_max ?? undefined,
      ebitda_min: values.ebitda_min ?? undefined,
      ebitda_max: values.ebitda_max ?? undefined,
      deal_size_min: values.deal_size_min ?? undefined,
      deal_size_max: values.deal_size_max ?? undefined,
      source_url: values.source_url || undefined,
      notes_internal: values.notes_internal || undefined,
      is_active: values.is_active,
    };
    await onSubmit(cleanedData);
  };

  // Tag input handlers
  const addTag = (field: 'cities' | 'search_keywords' | 'geography_focus' | 'sector_exclusions', value: string) => {
    if (!value.trim()) return;
    const current = form.getValues(field) || [];
    if (!current.includes(value.trim())) {
      form.setValue(field, [...current, value.trim()]);
    }
  };

  const removeTag = (field: 'cities' | 'search_keywords' | 'geography_focus' | 'sector_exclusions', value: string) => {
    const current = form.getValues(field) || [];
    form.setValue(field, current.filter(v => v !== value));
  };

  // Handle sector save from SectorMultiSelect
  const handleSectorSave = async (sectors: string[]) => {
    form.setValue('sector_focus', sectors);
    setIsEditingSectors(false);
  };

  // Number field handler for European format
  const handleNumberChange = (field: keyof FormValues, value: string) => {
    const parsed = parseNumberWithDots(value);
    form.setValue(field, parsed > 0 ? parsed : null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Profile Importer */}
        <ProfileImporter onImport={handleProfileImport} />

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyer_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Comprador</FormLabel>
                    <Select 
                      value={field.value || ''} 
                      onValueChange={(v) => field.onChange(v || null)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(BUYER_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio Web</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com" {...field} />
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
                    <FormLabel>País Base</FormLabel>
                    <Select 
                      value={field.value || ''} 
                      onValueChange={(v) => field.onChange(v || null)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cities Tag Input */}
            <FormField
              control={form.control}
              name="cities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudades</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Añadir ciudad..."
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag('cities', cityInput);
                            setCityInput('');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          addTag('cities', cityInput);
                          setCityInput('');
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {field.value.map((city) => (
                          <Badge key={city} variant="secondary" className="gap-1">
                            {city}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTag('cities', city)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Description and Investment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Descripción e Inversión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la empresa..."
                      className="min-h-[100px]"
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
              name="investment_thesis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tesis de Inversión</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Criterios de inversión y tesis..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sector Focus */}
            <div>
              <Label className="text-sm font-medium">Sectores Objetivo</Label>
              <div className="mt-2">
                {isEditingSectors ? (
                  <SectorMultiSelect
                    value={form.watch('sector_focus') || []}
                    onSave={handleSectorSave}
                    onCancel={() => setIsEditingSectors(false)}
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1 min-h-[32px] p-2 border rounded-md bg-muted/30">
                      {(form.watch('sector_focus') || []).length > 0 ? (
                        form.watch('sector_focus')!.map((sector) => (
                          <Badge key={sector} variant="secondary" className="text-xs">
                            {sector}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin sectores seleccionados</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingSectors(true)}
                    >
                      Editar Sectores
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sector Exclusions */}
            <FormField
              control={form.control}
              name="sector_exclusions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exclusiones de Sector</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Sector a excluir..."
                        value={exclusionInput}
                        onChange={(e) => setExclusionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag('sector_exclusions', exclusionInput);
                            setExclusionInput('');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          addTag('sector_exclusions', exclusionInput);
                          setExclusionInput('');
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {field.value.map((item) => (
                          <Badge key={item} variant="destructive" className="gap-1">
                            {item}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTag('sector_exclusions', item)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />

            {/* Geography Focus */}
            <FormField
              control={form.control}
              name="geography_focus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Geografía Objetivo</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="País o región..."
                        value={geoInput}
                        onChange={(e) => setGeoInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag('geography_focus', geoInput);
                            setGeoInput('');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          addTag('geography_focus', geoInput);
                          setGeoInput('');
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {field.value.map((item) => (
                          <Badge key={item} variant="outline" className="gap-1">
                            {item}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTag('geography_focus', item)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />

            {/* Search Keywords */}
            <FormField
              control={form.control}
              name="search_keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords de Búsqueda</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Añadir keyword..."
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag('search_keywords', keywordInput);
                            setKeywordInput('');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          addTag('search_keywords', keywordInput);
                          setKeywordInput('');
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {field.value.map((item) => (
                          <Badge key={item} className="gap-1 bg-primary/10 text-primary">
                            {item}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTag('search_keywords', item)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Financial Ranges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Rangos Financieros (€)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facturación Mínima</Label>
                <Input
                  placeholder="1.000.000"
                  value={form.watch('revenue_min') ? formatNumberWithDots(form.watch('revenue_min')!) : ''}
                  onChange={(e) => handleNumberChange('revenue_min', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Facturación Máxima</Label>
                <Input
                  placeholder="50.000.000"
                  value={form.watch('revenue_max') ? formatNumberWithDots(form.watch('revenue_max')!) : ''}
                  onChange={(e) => handleNumberChange('revenue_max', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>EBITDA Mínimo</Label>
                <Input
                  placeholder="500.000"
                  value={form.watch('ebitda_min') ? formatNumberWithDots(form.watch('ebitda_min')!) : ''}
                  onChange={(e) => handleNumberChange('ebitda_min', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>EBITDA Máximo</Label>
                <Input
                  placeholder="10.000.000"
                  value={form.watch('ebitda_max') ? formatNumberWithDots(form.watch('ebitda_max')!) : ''}
                  onChange={(e) => handleNumberChange('ebitda_max', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ticket Mínimo</Label>
                <Input
                  placeholder="2.000.000"
                  value={form.watch('deal_size_min') ? formatNumberWithDots(form.watch('deal_size_min')!) : ''}
                  onChange={(e) => handleNumberChange('deal_size_min', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ticket Máximo</Label>
                <Input
                  placeholder="100.000.000"
                  value={form.watch('deal_size_max') ? formatNumberWithDots(form.watch('deal_size_max')!) : ''}
                  onChange={(e) => handleNumberChange('deal_size_max', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internal Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Datos Internos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="source_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Fuente (LinkedIn/Apollo)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/company/..." {...field} />
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
                  <FormLabel>Notas Internas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas privadas del equipo..."
                      className="min-h-[80px]"
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
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Comprador Activo</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Los compradores inactivos no aparecen en búsquedas
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar Comprador
          </Button>
        </div>
      </form>
    </Form>
  );
}
