
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardCharts = () => {
  const performanceData = [
    { mes: 'Ene', valoraciones: 12, leads: 45, blogViews: 1200 },
    { mes: 'Feb', valoraciones: 19, leads: 52, blogViews: 1580 },
    { mes: 'Mar', valoraciones: 15, leads: 38, blogViews: 1320 },
    { mes: 'Abr', valoraciones: 25, leads: 67, blogViews: 1890 },
    { mes: 'May', valoraciones: 22, leads: 58, blogViews: 1650 },
    { mes: 'Jun', valoraciones: 30, leads: 78, blogViews: 2100 }
  ];

  const sectorData = [
    { sector: 'Tecnología', valoraciones: 45, fill: '#3B82F6' },
    { sector: 'Retail', valoraciones: 28, fill: '#10B981' },
    { sector: 'Industrial', valoraciones: 25, fill: '#8B5CF6' },
    { sector: 'Servicios', valoraciones: 22, fill: '#F59E0B' },
    { sector: 'Otros', valoraciones: 20, fill: '#EF4444' }
  ];

  const conversionData = [
    { funnel: 'Visitantes', cantidad: 2400, fill: '#E5E7EB' },
    { funnel: 'Leads', cantidad: 480, fill: '#9CA3AF' },
    { funnel: 'Consultas', cantidad: 120, fill: '#6B7280' },
    { funnel: 'Clientes', cantidad: 24, fill: '#374151' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Performance Chart */}
      <Card className="lg:col-span-2 border-0 shadow-sm bg-gradient-to-br from-slate-50 to-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            Rendimiento Mensual
          </CardTitle>
          <p className="text-sm text-slate-600">Evolución de valoraciones, leads y visualizaciones</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="valoraciones" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="leads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="mes" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Area
                type="monotone"
                dataKey="valoraciones"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#valoraciones)"
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#leads)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sector Distribution */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            Sectores Activos
          </CardTitle>
          <p className="text-sm text-slate-600">Distribución por industria</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="valoraciones"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {sectorData.map((sector, index) => (
              <div key={sector.sector} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.fill }}></div>
                  <span className="text-slate-600">{sector.sector}</span>
                </div>
                <span className="font-medium text-slate-900">{sector.valoraciones}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card className="lg:col-span-3 border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
            Embudo de Conversión
          </CardTitle>
          <p className="text-sm text-slate-600">De visitantes a clientes - rendimiento del mes actual</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={conversionData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" fontSize={12} />
              <YAxis dataKey="funnel" type="category" stroke="#6B7280" fontSize={12} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Bar dataKey="cantidad" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
