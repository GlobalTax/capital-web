
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, Mail, Clock, TrendingUp } from 'lucide-react';

interface CriticalLeadsPanelProps {
  getLeadsPriority: () => any[];
  isConnected: boolean;
  totalHotLeads: number;
}

const CriticalLeadsPanel = ({ getLeadsPriority, isConnected, totalHotLeads }: CriticalLeadsPanelProps) => {
  const priorityLeads = getLeadsPriority();

  const getPriorityIcon = (priority: string) => {
    return priority === 'critical' ? 
      <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" /> :
      <TrendingUp className="h-4 w-4 text-orange-500" />;
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'critical' ? 
      'border-red-500 bg-red-50' : 
      'border-orange-500 bg-orange-50';
  };

  const handleQuickCall = (lead: any) => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`);
    } else {
      // Si no hay teléfono, buscar en Apollo o mostrar modal de búsqueda
      console.log('Buscar teléfono para:', lead.company_domain);
    }
  };

  const handleQuickEmail = (lead: any) => {
    const subject = `Oportunidad M&A - ${lead.company_name || lead.company_domain}`;
    const body = `Estimado equipo de ${lead.company_name || lead.company_domain},

Hemos detectado su interés en servicios de fusiones y adquisiciones. En Capittal, especialistas en M&A con sede en Madrid (P.º de la Castellana, 11, B - A), podemos ayudarles con:

• Valoración profesional de empresa
• Asesoramiento en procesos de venta
• Búsqueda de inversores estratégicos
• Due diligence completa

¿Sería posible programar una llamada esta semana para discutir su situación?

Saludos cordiales,
Equipo Capittal
P.º de la Castellana, 11, B - A, Madrid`;

    window.open(`mailto:${lead.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-red-700">
            🚨 LEADS CRÍTICOS
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'En vivo' : 'Desconectado'}
            </span>
            <Badge variant="destructive">{totalHotLeads}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {priorityLeads.length > 0 ? (
          priorityLeads.map((lead) => (
            <div
              key={lead.id}
              className={`p-3 rounded-lg border-2 ${getPriorityColor(lead.priority)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(lead.priority)}
                  <div>
                    <div className="font-semibold text-sm">
                      {lead.company_name || lead.company_domain || 'Empresa Anónima'}
                    </div>
                    <div className="text-xs text-gray-600">
                      Score: {lead.total_score} • Hace {lead.timeAgo}min
                    </div>
                  </div>
                </div>
                <Badge 
                  className={lead.priority === 'critical' ? 'bg-red-500' : 'bg-orange-500'}
                >
                  {lead.priority === 'critical' ? 'CRÍTICO' : 'ALTO'}
                </Badge>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickCall(lead)}
                  className="flex items-center gap-1 text-xs"
                >
                  <Phone className="w-3 h-3" />
                  Llamar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickEmail(lead)}
                  className="flex items-center gap-1 text-xs"
                >
                  <Mail className="w-3 h-3" />
                  Email
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => window.open(`/admin/contact-leads`, '_blank')}
                >
                  Ver Detalles
                </Button>
              </div>

              {lead.industry && (
                <div className="mt-2 text-xs text-gray-500">
                  Sector: {lead.industry}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay leads críticos en este momento</p>
            <p className="text-xs">Se mostrarán automáticamente cuando aparezcan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CriticalLeadsPanel;
