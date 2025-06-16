import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import StatisticPreview from './preview/StatisticPreview';

interface Statistic {
  id: string;
  metric_key: string;
  metric_value: string;
  metric_label: string;
  display_order: number;
  is_active: boolean;
  display_locations?: string[];
}

const availableLocations = [
  { value: 'home', label: 'Página Principal' },
  { value: 'market-insights', label: 'Market Insights' },
  { value: 'nosotros', label: 'Nosotros' },
  { value: 'servicios', label: 'Servicios' }
];

const StatisticsManager = () => {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStatistic, setEditingStatistic] = useState<Statistic | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('key_statistics')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setStatistics(data || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (statistic: Statistic) => {
    try {
      const { error } = await supabase
        .from('key_statistics')
        .update({
          metric_value: statistic.metric_value,
          metric_label: statistic.metric_label,
          display_order: statistic.display_order,
          is_active: statistic.is_active,
          display_locations: statistic.display_locations
        })
        .eq('id', statistic.id);

      if (error) throw error;
      
      toast({ title: "Estadística actualizada correctamente" });
      setEditingStatistic(null);
      fetchStatistics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (id: string, field: keyof Statistic, value: any) => {
    setStatistics(prev => prev.map(stat => 
      stat.id === id ? { ...stat, [field]: value } : stat
    ));
  };

  const handleLocationChange = (statisticId: string, location: string, checked: boolean) => {
    setStatistics(prev => prev.map(stat => {
      if (stat.id === statisticId) {
        const currentLocations = stat.display_locations || [];
        const newLocations = checked 
          ? [...currentLocations, location]
          : currentLocations.filter(loc => loc !== location);
        return { ...stat, display_locations: newLocations };
      }
      return stat;
    }));
  };

  if (isLoading) {
    return <div className="p-6">Cargando estadísticas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Gestión de Estadísticas Clave</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {statistics.map((statistic) => (
          <div key={statistic.id} className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
            {editingStatistic?.id === statistic.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Valor</label>
                    <Input
                      value={statistic.metric_value}
                      onChange={(e) => handleInputChange(statistic.id, 'metric_value', e.target.value)}
                      className="border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Etiqueta</label>
                    <Input
                      value={statistic.metric_label}
                      onChange={(e) => handleInputChange(statistic.id, 'metric_label', e.target.value)}
                      className="border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Orden</label>
                    <Input
                      type="number"
                      value={statistic.display_order}
                      onChange={(e) => handleInputChange(statistic.id, 'display_order', parseInt(e.target.value))}
                      className="border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Ubicaciones donde mostrar</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableLocations.map((location) => (
                      <label key={location.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={statistic.display_locations?.includes(location.value) || false}
                          onChange={(e) => handleLocationChange(statistic.id, location.value, e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{location.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={statistic.is_active}
                      onChange={(e) => handleInputChange(statistic.id, 'is_active', e.target.checked)}
                      className="mr-2"
                    />
                    Activo
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleUpdate(statistic)}
                    className="bg-black text-white border border-black rounded-lg"
                  >
                    Guardar
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border border-gray-300 rounded-lg"
                      >
                        Previsualizar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Previsualización</DialogTitle>
                      </DialogHeader>
                      <StatisticPreview statistic={statistic} />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() => setEditingStatistic(null)}
                    className="border border-gray-300 rounded-lg"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black">{statistic.metric_key}</h3>
                  <div className="text-gray-600">
                    <span className="text-2xl font-bold text-black mr-2">{statistic.metric_value}</span>
                    <span>{statistic.metric_label}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Orden: {statistic.display_order} | 
                    {statistic.is_active ? (
                      <span className="text-green-600 ml-1">Activo</span>
                    ) : (
                      <span className="text-red-600 ml-1">Inactivo</span>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">Ubicaciones: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(statistic.display_locations || []).map((location) => {
                        const locationLabel = availableLocations.find(loc => loc.value === location)?.label || location;
                        return (
                          <span key={location} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {locationLabel}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditingStatistic(statistic)}
                  className="border border-gray-300 rounded-lg"
                >
                  Editar
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsManager;
