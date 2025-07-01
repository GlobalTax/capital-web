
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface LeadScore {
  id: string;
  company_name?: string;
  company_domain?: string;
}

interface LeadAlert {
  id: string;
  message: string;
  created_at: string;
  priority: string;
  lead_score?: LeadScore;
}

interface LeadAlertsSectionProps {
  unreadAlerts: LeadAlert[] | undefined;
  onMarkAsRead: (alertId: string) => void;
}

const LeadAlertsSection = ({ unreadAlerts, onMarkAsRead }: LeadAlertsSectionProps) => {
  if (!unreadAlerts || unreadAlerts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Alertas Recientes ({unreadAlerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {unreadAlerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{alert.message}</p>
                <p className="text-sm text-gray-600">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
                {alert.priority === 'high' && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mt-1 inline-block">
                    Alta Prioridad
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMarkAsRead(alert.id)}
              >
                Marcar Leída
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadAlertsSection;
