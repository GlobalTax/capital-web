
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceChart = () => {
  const data = [
    { month: 'Ene', casos: 12, operaciones: 8, leads: 45 },
    { month: 'Feb', casos: 15, operaciones: 12, leads: 52 },
    { month: 'Mar', casos: 18, operaciones: 15, leads: 38 },
    { month: 'Abr', casos: 22, operaciones: 18, leads: 65 },
    { month: 'May', casos: 25, operaciones: 20, leads: 48 },
    { month: 'Jun', casos: 28, operaciones: 25, leads: 72 }
  ];

  return (
    <Card className="border border-gray-100 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Performance Mensual
        </CardTitle>
        <p className="text-sm text-gray-600">
          Evolución de casos, operaciones y leads generados
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="casos" fill="#3b82f6" name="Casos de Éxito" radius={[2, 2, 0, 0]} />
              <Bar dataKey="operaciones" fill="#10b981" name="Operaciones" radius={[2, 2, 0, 0]} />
              <Bar dataKey="leads" fill="#f59e0b" name="Leads" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-600">Casos de Éxito</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600">Operaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Leads</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
