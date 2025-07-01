
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Phone, Mail } from 'lucide-react';

interface LeadScore {
  id: string;
  visitor_id: string;
  company_domain?: string;
  company_name?: string;
  industry?: string;
  total_score: number;
  last_activity: string;
  visit_count: number;
  email?: string;
  phone?: string;
  contact_name?: string;
}

interface HotLeadsSectionProps {
  hotLeads: LeadScore[] | undefined;
  isLoading: boolean;
}

const HotLeadsSection = ({ hotLeads, isLoading }: HotLeadsSectionProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Hot Leads - Cargando...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-red-600" />
          Hot Leads - Acción Inmediata Requerida
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hotLeads || hotLeads.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay hot leads en este momento</p>
            <p className="text-sm text-gray-400">Los leads aparecerán aquí cuando superen 80 puntos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hotLeads.slice(0, 10).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {lead.company_name || lead.company_domain || 'Lead Anónimo'}
                    </h3>
                    <Badge className="bg-red-100 text-red-800">
                      {lead.total_score} puntos
                    </Badge>
                    {lead.industry && (
                      <Badge variant="outline">{lead.industry}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {lead.contact_name && (
                      <p>👤 Contacto: {lead.contact_name}</p>
                    )}
                    {lead.email && (
                      <p className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </p>
                    )}
                    {lead.phone && (
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </p>
                    )}
                    <p>🕐 Última actividad: {new Date(lead.last_activity).toLocaleDateString()}</p>
                    <p>🔄 Visitas: {lead.visit_count}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Contactar Ahora
                  </Button>
                  <Button size="sm" variant="outline">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HotLeadsSection;
