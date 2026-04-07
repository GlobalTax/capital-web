import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBuyerPreferences } from '@/hooks/useBuyerPreferences';
import { useForm } from 'react-hook-form';
import { Bell, X } from 'lucide-react';

interface BuyerPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectors?: string[];
  locations?: string[];
}

const BuyerPreferencesModal: React.FC<BuyerPreferencesModalProps> = ({
  isOpen,
  onClose,
  sectors = [],
  locations = []
}) => {
  const { preferences, savePreferences, isSaving } = useBuyerPreferences();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  const selectedSectors = watch('preferred_sectors') || [];
  const selectedLocations = watch('preferred_locations') || [];

  useEffect(() => {
    if (preferences) {
      setValue('full_name', preferences.full_name || '');
      setValue('email', preferences.email || '');
      setValue('phone', preferences.phone || '');
      setValue('company', preferences.company || '');
      setValue('preferred_sectors', preferences.preferred_sectors || []);
      setValue('preferred_locations', preferences.preferred_locations || []);
      setValue('min_valuation', preferences.min_valuation);
      setValue('max_valuation', preferences.max_valuation);
      setValue('alert_frequency', preferences.alert_frequency);
    }
  }, [preferences, setValue]);

  const toggleSector = (sector: string) => {
    const current = selectedSectors;
    if (current.includes(sector)) {
      setValue('preferred_sectors', current.filter((s: string) => s !== sector));
    } else {
      setValue('preferred_sectors', [...current, sector]);
    }
  };

  const toggleLocation = (location: string) => {
    const current = selectedLocations;
    if (current.includes(location)) {
      setValue('preferred_locations', current.filter((l: string) => l !== location));
    } else {
      setValue('preferred_locations', [...current, location]);
    }
  };

  const onSubmit = (data: any) => {
    if (!data.email || !data.full_name) return;
    
    savePreferences({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || undefined,
      company: data.company || undefined,
      preferred_sectors: data.preferred_sectors,
      preferred_locations: data.preferred_locations,
      min_valuation: data.min_valuation ? parseFloat(data.min_valuation) : undefined,
      max_valuation: data.max_valuation ? parseFloat(data.max_valuation) : undefined,
      alert_frequency: data.alert_frequency,
      is_active: true
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurar Alertas de Oportunidades
          </DialogTitle>
          <DialogDescription>
            Recibe notificaciones cuando aparezcan operaciones que coincidan con tus preferencias
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Datos de contacto</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nombre completo *</Label>
                <Input
                  id="full_name"
                  {...register('full_name', { required: true })}
                  placeholder="Tu nombre y apellidos"
                  className={errors.full_name ? 'border-destructive' : ''}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { required: true })}
                  placeholder="tu@email.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  {...register('company')}
                  placeholder="Nombre de tu empresa"
                />
              </div>
            </div>
          </div>

          {sectors.length > 0 && (
            <div>
              <Label>Sectores de Interés</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {sectors.map(sector => (
                  <Badge
                    key={sector}
                    variant={selectedSectors.includes(sector) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleSector(sector)}
                  >
                    {sector}
                    {selectedSectors.includes(sector) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {locations.length > 0 && (
            <div>
              <Label>Ubicaciones de Interés</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {locations.map(location => (
                  <Badge
                    key={location}
                    variant={selectedLocations.includes(location) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleLocation(location)}
                  >
                    {location}
                    {selectedLocations.includes(location) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valoración Mínima (€)</Label>
              <Input
                type="number"
                {...register('min_valuation')}
                placeholder="1000000"
              />
            </div>
            <div>
              <Label>Valoración Máxima (€)</Label>
              <Input
                type="number"
                {...register('max_valuation')}
                placeholder="10000000"
              />
            </div>
          </div>

          <div>
            <Label>Frecuencia de Alertas</Label>
            <Select 
              defaultValue={preferences?.alert_frequency || 'weekly'}
              onValueChange={(value) => setValue('alert_frequency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diaria</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BuyerPreferencesModal;
