
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Plus, Edit, Eye } from 'lucide-react';

interface ScoringRule {
  id: string;
  name: string;
  trigger_type: string;
  page_pattern?: string;
  points: number;
  description: string;
  is_active: boolean;
  decay_days?: number;
}

const LeadScoringRulesManager = () => {
  const { data: scoringRules, isLoading } = useQuery({
    queryKey: ['leadScoringRules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_scoring_rules')
        .select('*')
        .order('points', { ascending: false });

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('No admin access to scoring rules');
          return [];
        }
        throw error;
      }
      return data as ScoringRule[];
    },
    staleTime: 300000, // 5 minutos
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reglas de scoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reglas de Lead Scoring</h1>
          <p className="text-gray-600 mt-2">
            Configura las reglas que determinan la puntuación de los leads
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Regla
        </Button>
      </div>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Reglas Configuradas ({scoringRules?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!scoringRules || scoringRules.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay reglas de scoring configuradas</p>
              <p className="text-sm text-gray-400">
                Las reglas determinan cuántos puntos se asignan por cada acción del usuario
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {scoringRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-4 border rounded-lg ${
                    rule.is_active ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                      <Badge variant="outline">
                        {rule.points} puntos
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Tipo:</strong> {rule.trigger_type}</p>
                    {rule.page_pattern && (
                      <p><strong>Patrón de página:</strong> {rule.page_pattern}</p>
                    )}
                    <p><strong>Descripción:</strong> {rule.description}</p>
                    {rule.decay_days && (
                      <p><strong>Decaimiento:</strong> {rule.decay_days} días</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Reglas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {scoringRules?.filter(rule => rule.is_active).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Puntuación Máxima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {scoringRules?.reduce((max, rule) => Math.max(max, rule.points), 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tipos de Trigger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(scoringRules?.map(rule => rule.trigger_type)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadScoringRulesManager;
