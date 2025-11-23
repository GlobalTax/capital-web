import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAnalyticsConfig } from '@/hooks/useAnalyticsConfig';
import { Loader2, Save, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

export const AnalyticsConfigPanel: React.FC = () => {
  const { thresholds, isLoading, updateThresholds, isUpdating } = useAnalyticsConfig();
  const [warmMinutes, setWarmMinutes] = React.useState(thresholds.warm_minutes);
  const [coldMinutes, setColdMinutes] = React.useState(thresholds.cold_minutes);

  React.useEffect(() => {
    setWarmMinutes(thresholds.warm_minutes);
    setColdMinutes(thresholds.cold_minutes);
  }, [thresholds]);

  const handleSave = async () => {
    try {
      await updateThresholds({
        warm_minutes: warmMinutes,
        cold_minutes: coldMinutes,
      });
      toast.success('Configuración actualizada correctamente');
    } catch (error) {
      toast.error('Error al actualizar configuración');
      console.error(error);
    }
  };

  const hasChanges = warmMinutes !== thresholds.warm_minutes || 
                     coldMinutes !== thresholds.cold_minutes;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Configuración de Umbrales
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Configuración de Umbrales de Sesión
        </CardTitle>
        <CardDescription>
          Define cuándo una sesión se considera "tibia" o "fría" según minutos de inactividad
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Umbral Tibia */}
          <div className="space-y-2">
            <Label htmlFor="warm-threshold">
              🟡 Umbral "Tibia" (minutos)
            </Label>
            <Select
              value={warmMinutes.toString()}
              onValueChange={(val) => setWarmMinutes(Number(val))}
            >
              <SelectTrigger id="warm-threshold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {thresholds.available_options
                  .filter(opt => opt < coldMinutes)
                  .map(opt => (
                    <SelectItem key={opt} value={opt.toString()}>
                      {opt} minutos
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Sesiones sin actividad entre {warmMinutes}-{coldMinutes} minutos se marcarán como "tibias"
            </p>
          </div>

          {/* Umbral Fría */}
          <div className="space-y-2">
            <Label htmlFor="cold-threshold">
              ❄️ Umbral "Fría" (minutos)
            </Label>
            <Select
              value={coldMinutes.toString()}
              onValueChange={(val) => setColdMinutes(Number(val))}
            >
              <SelectTrigger id="cold-threshold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {thresholds.available_options
                  .filter(opt => opt > warmMinutes)
                  .map(opt => (
                    <SelectItem key={opt} value={opt.toString()}>
                      {opt} minutos
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Sesiones sin actividad por más de {coldMinutes} minutos se marcarán como "frías" (abandonadas)
            </p>
          </div>
        </div>

        {/* Resumen visual */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">Resumen de Clasificación:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>🔥 <strong>Caliente</strong>: 0-{warmMinutes} minutos de inactividad</li>
            <li>🟡 <strong>Tibia</strong>: {warmMinutes}-{coldMinutes} minutos de inactividad</li>
            <li>❄️ <strong>Fría</strong>: Más de {coldMinutes} minutos de inactividad</li>
            <li>✅ <strong>Completada</strong>: Tiene valoración final</li>
          </ul>
        </div>

        {/* Botón guardar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
