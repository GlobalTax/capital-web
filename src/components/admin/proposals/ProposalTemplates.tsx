import React from 'react';
import { useProposals } from '@/hooks/useProposals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SERVICE_TYPE_LABELS } from '@/types/proposals';
import { Edit, Copy, Trash2, Plus } from 'lucide-react';

export const ProposalTemplates = () => {
  const { templates } = useProposals();

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Plantillas de Propuestas</h2>
          <p className="text-sm text-gray-600">
            Gestiona las plantillas predefinidas para diferentes tipos de servicios
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                  <Badge variant="outline">
                    {SERVICE_TYPE_LABELS[template.service_type]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 min-h-[40px]">
                {template.description}
              </p>

              {/* Fee Structure */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Estructura de Honorarios:</h4>
                <div className="space-y-1 text-sm">
                  {template.base_fee_percentage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Honorario Base:</span>
                      <span className="font-medium">{template.base_fee_percentage}%</span>
                    </div>
                  )}
                  {template.success_fee_percentage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Honorario Éxito:</span>
                      <span className="font-medium">{template.success_fee_percentage}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mínimo:</span>
                    <span className="font-medium">{formatCurrency(template.minimum_fee)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay plantillas disponibles</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Plantilla
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};