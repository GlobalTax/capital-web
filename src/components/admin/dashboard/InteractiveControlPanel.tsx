
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, TrendingUp, Filter, Calendar, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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
    { sector: 'Tecnología', valoraciones: 45, porcentaje: 32 },
    { sector: 'Retail', valoraciones: 28, porcentaje: 20 },
    { sector: 'Industrial', valoraciones: 25, porcentaje: 18 },
    { sector: 'Servicios', valoraciones: 22, porcentaje: 16 },
    { sector: 'Otros', valoraciones: 20, porcentaje: 14 }
  ];

  const filters = [
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
    { key: '3m', label: '3 meses' },
    { key: '1y', label: '1 año' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Gráfico Principal */}
      <Card className="lg:col-span-2 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Valoraciones y Leads
            </CardTitle>
            <div className="flex items-center gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.key}
                  variant={activeFilter === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.key)}
                  className="text-xs"
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
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="valoraciones" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Valoraciones"
              />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Leads"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Panel de Sectores */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-600" />
            Top Sectores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectorData.map((item, index) => (
              <div key={item.sector} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    index === 3 ? 'bg-orange-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium">{item.sector}</span>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {item.valoraciones}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{item.porcentaje}%</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveControlPanel;
