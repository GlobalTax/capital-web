
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Sistema inicializado correctamente</p>
              <p className="text-xs text-gray-500">Panel de administración configurado</p>
            </div>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">La actividad reciente aparecerá aquí</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
