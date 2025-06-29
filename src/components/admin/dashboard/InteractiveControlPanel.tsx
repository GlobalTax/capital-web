
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InteractiveControlPanel = () => {
  const [activeFilter, setActiveFilter] = useState('30d');
  
  const chartData = [
    { mes: 'Ene', valoraciones: 12, leads: 45 },
    { mes: 'Feb', valoraciones: 19, leads: 52 },
    { mes: 'Mar', valoraciones: 15, leads: 38 },
    { mes: 'Abr', valoraciones: 25, leads: 67 },
    { mes: 'May', valoraciones: 22, leads: 58 },
    { mes: 'Jun', valoraciones: 30, leads: 78 }
  ];

  const sectorData = [
    { sector: 'Tecnología', valoraciones: 45 },
    { sector: 'Retail', valoraciones: 28 },
    { sector: 'Industrial', valoraciones: 25 },
    { sector: 'Servicios', valoraciones: 22 },
    { sector: 'Otros', valoraciones: 20 }
  ];

  const filters = [
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
    { key: '3m', label: '3 meses' },
    { key: '1y', label: '1 año' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {/* Gráfico Principal */}
      <Card className="lg:col-span-2 bg-white border border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-light text-gray-900">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              Valoraciones y Leads
            </CardTitle>
            <div className="flex items-center gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.key}
                  variant={activeFilter === filter.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.key)}
                  className="text-xs text-gray-600"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '6px', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="valoraciones" 
                stroke="#64748b" 
                strokeWidth={2}
                dot={{ fill: '#64748b', strokeWidth: 2, r: 3 }}
                name="Valoraciones"
              />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#94a3b8" 
                strokeWidth={2}
                dot={{ fill: '#94a3b8', strokeWidth: 2, r: 3 }}
                name="Leads"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Panel de Sectores */}
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-light text-gray-900">
            <PieChart className="h-5 w-5 text-gray-600" />
            Top Sectores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectorData.map((item, index) => (
              <div key={item.sector} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-sm text-gray-700">{item.sector}</span>
                </div>
                <span className="text-sm text-gray-500">{item.valoraciones}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveControlPanel;
