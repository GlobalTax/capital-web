import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { BuySideMandate, BuySideMandateInput } from '@/hooks/useBuySideMandates';
import SectorSelect from '@/components/admin/shared/SectorSelect';

const mandateSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  sector: z.string().min(1, 'El sector es obligatorio'),
  subsector: z.string().optional(),
  geographic_scope: z.string().min(1, 'El ámbito geográfico es obligatorio'),
  revenue_min: z.number().nullable(),
  revenue_max: z.number().nullable(),
  ebitda_min: z.number().nullable(),
  ebitda_max: z.number().nullable(),
  is_active: z.boolean(),
  is_new: z.boolean(),
});

type MandateFormData = z.infer<typeof mandateSchema>;

interface BuySideMandateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mandate?: BuySideMandate | null;
  onSave: (mandate: BuySideMandateInput) => void;
  isLoading?: boolean;
}

const GEOGRAPHIC_SCOPES = [
  'España',
  'Cataluña',
  'Madrid',
  'País Vasco',
  'Andalucía',
  'Valencia',
  'Galicia',
  'Europa',
  'Latinoamérica',
  'Global',
];

export const BuySideMandateModal: React.FC<BuySideMandateModalProps> = ({
  open,
  onOpenChange,
  mandate,
  onSave,
  isLoading,
}) => {
  const [requirements, setRequirements] = React.useState<string[]>([]);
  const [newRequirement, setNewRequirement] = React.useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MandateFormData>({
    resolver: zodResolver(mandateSchema),
    defaultValues: {
      title: '',
      description: '',
      sector: '',
      subsector: '',
      geographic_scope: '',
      revenue_min: null,
      revenue_max: null,
      ebitda_min: null,
      ebitda_max: null,
      is_active: true,
      is_new: true,
    },
  });

  const isActive = watch('is_active');
  const isNew = watch('is_new');

  useEffect(() => {
    if (mandate) {
      reset({
        title: mandate.title,
        description: mandate.description || '',
        sector: mandate.sector,
        subsector: mandate.subsector || '',
        geographic_scope: mandate.geographic_scope,
        revenue_min: mandate.revenue_min,
        revenue_max: mandate.revenue_max,
        ebitda_min: mandate.ebitda_min,
        ebitda_max: mandate.ebitda_max,
        is_active: mandate.is_active ?? true,
        is_new: mandate.is_new ?? true,
      });
      setRequirements(mandate.requirements || []);
    } else {
      reset({
        title: '',
        description: '',
        sector: '',
        subsector: '',
        geographic_scope: '',
        revenue_min: null,
        revenue_max: null,
        ebitda_min: null,
        ebitda_max: null,
        is_active: true,
        is_new: true,
      });
      setRequirements([]);
    }
  }, [mandate, reset]);

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const onSubmit = (data: MandateFormData) => {
    const mandateInput: BuySideMandateInput = {
      title: data.title,
      sector: data.sector,
      geographic_scope: data.geographic_scope,
      description: data.description || null,
      subsector: data.subsector || null,
      revenue_min: data.revenue_min,
      revenue_max: data.revenue_max,
      ebitda_min: data.ebitda_min,
      ebitda_max: data.ebitda_max,
      is_active: data.is_active,
      is_new: data.is_new,
      requirements: requirements.length > 0 ? requirements : null,
    };
    onSave(mandateInput);
  };

  const parseNumber = (value: string): number | null => {
    if (!value) return null;
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mandate ? 'Editar Mandato de Compra' : 'Nuevo Mandato de Compra'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Información básica</h3>
            
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ej: Empresa de software SaaS B2B"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción detallada del tipo de empresa buscada..."
                rows={3}
              />
            </div>
          </div>

          {/* Clasificación */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Clasificación</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sector">Sector *</Label>
                <SectorSelect
                  value={watch('sector')}
                  onChange={(value) => setValue('sector', value)}
                  placeholder="Seleccionar sector"
                  required
                />
                {errors.sector && (
                  <p className="text-sm text-destructive mt-1">{errors.sector.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="subsector">Subsector</Label>
                <Input
                  id="subsector"
                  {...register('subsector')}
                  placeholder="Ej: SaaS, Fintech..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="geographic_scope">Ámbito geográfico *</Label>
              <select
                id="geographic_scope"
                {...register('geographic_scope')}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">Seleccionar ámbito</option>
                {GEOGRAPHIC_SCOPES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.geographic_scope && (
                <p className="text-sm text-destructive mt-1">{errors.geographic_scope.message}</p>
              )}
            </div>
          </div>

          {/* Criterios financieros */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Criterios financieros</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue_min">Facturación mínima (€)</Label>
                <Input
                  id="revenue_min"
                  type="text"
                  placeholder="Ej: 1.000.000"
                  onChange={(e) => setValue('revenue_min', parseNumber(e.target.value))}
                  defaultValue={mandate?.revenue_min?.toLocaleString('es-ES') || ''}
                />
              </div>
              <div>
                <Label htmlFor="revenue_max">Facturación máxima (€)</Label>
                <Input
                  id="revenue_max"
                  type="text"
                  placeholder="Ej: 10.000.000"
                  onChange={(e) => setValue('revenue_max', parseNumber(e.target.value))}
                  defaultValue={mandate?.revenue_max?.toLocaleString('es-ES') || ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ebitda_min">EBITDA mínimo (€)</Label>
                <Input
                  id="ebitda_min"
                  type="text"
                  placeholder="Ej: 200.000"
                  onChange={(e) => setValue('ebitda_min', parseNumber(e.target.value))}
                  defaultValue={mandate?.ebitda_min?.toLocaleString('es-ES') || ''}
                />
              </div>
              <div>
                <Label htmlFor="ebitda_max">EBITDA máximo (€)</Label>
                <Input
                  id="ebitda_max"
                  type="text"
                  placeholder="Ej: 2.000.000"
                  onChange={(e) => setValue('ebitda_max', parseNumber(e.target.value))}
                  defaultValue={mandate?.ebitda_max?.toLocaleString('es-ES') || ''}
                />
              </div>
            </div>
          </div>

          {/* Requisitos */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Requisitos específicos</h3>
            
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Añadir requisito..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" variant="outline" size="icon" onClick={addRequirement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {requirements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {requirements.map((req, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Configuración */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Configuración</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Mandato activo</Label>
                <p className="text-sm text-muted-foreground">
                  Los mandatos activos aparecen en el selector de newsletters
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Marcar como "Nuevo"</Label>
                <p className="text-sm text-muted-foreground">
                  Muestra una insignia destacada en el mandato
                </p>
              </div>
              <Switch
                checked={isNew}
                onCheckedChange={(checked) => setValue('is_new', checked)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : mandate ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
