
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface MarketingAlertsTabProps {
  alerts: any[];
  unreadAlerts: number;
  markAlertAsRead: (alertId: string) => void;
}

const MarketingAlertsTab = ({ alerts, unreadAlerts, markAlertAsRead }: MarketingAlertsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Todas las Alertas
          {unreadAlerts > 0 && (
            <Badge variant="destructive">{unreadAlerts} nuevas</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`border rounded-lg p-4 ${!alert.isRead ? 'bg-blue-50 border-blue-200' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={alert.priority === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.priority.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">{alert.type}</span>
                  {!alert.isRead && <Badge variant="outline">NUEVA</Badge>}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(alert.createdAt).toLocaleString()}
                </span>
              </div>
              
              <h3 className="font-semibold mb-2">{alert.title}</h3>
              <p className="text-sm text-gray-700 mb-3">{alert.description}</p>
              
              {alert.actions && alert.actions.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-800 mb-1">Acciones recomendadas:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {alert.actions.slice(0, 3).map((action, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Lead Score: {alert.leadScore}
                </span>
                {!alert.isRead && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => markAlertAsRead(alert.id)}
                  >
                    Marcar como leída
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketingAlertsTab;
