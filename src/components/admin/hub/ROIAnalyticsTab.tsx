
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROIAnalytics } from '@/types/marketingHub';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Target, Percent } from 'lucide-react';

interface ROIAnalyticsTabProps {
  roiAnalytics?: ROIAnalytics;
}

const ROIAnalyticsTab = ({ roiAnalytics }: ROIAnalyticsTabProps) => {
  if (!roiAnalytics) {
    return <div>Cargando datos de ROI...</div>;
  }

  const channelColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* KPIs principales de ROI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI General</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{roiAnalytics.overallROI}%</div>
            <p className="text-xs text-gray-600">retorno de inversión</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inversión Total</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{roiAnalytics.totalInvestment.toLocaleString()}</div>
            <p className="text-xs text-gray-600">invertido en marketing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Generados</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{roiAnalytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600">ingresos atribuidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <Percent className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              €{(roiAnalytics.totalRevenue - roiAnalytics.totalInvestment).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">beneficio neto</p>
          </CardContent>
        </Card>
      </div>

      {/* ROI por Canal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 ROI por Canal de Marketing</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiAnalytics.channelROI} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'ROI']} />
                <Bar dataKey="roi" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💰 Distribución de Inversión</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roiAnalytics.channelROI}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="investment"
                  nameKey="channel"
                  label={({ channel, investment, percent }) => 
                    `${channel}: €${investment.toLocaleString()} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {roiAnalytics.channelROI.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={channelColors[index % channelColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, 'Inversión']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla detallada de canales */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Análisis Detallado por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roiAnalytics.channelROI
              .sort((a, b) => b.roi - a.roi)
              .map((channel, index) => (
                <div key={channel.channel} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-xs"
                        style={{ 
                          backgroundColor: channelColors[index % channelColors.length] + '20',
                          borderColor: channelColors[index % channelColors.length]
                        }}
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-semibold">{channel.channel}</h3>
                        <p className="text-sm text-gray-500">{channel.leads} leads generados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{channel.roi}%</div>
                      <div className="text-sm text-gray-500">ROI</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold">€{channel.investment.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Inversión</div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">€{channel.revenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Ingresos</div>
                    </div>

                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{channel.leads}</div>
                      <div className="text-xs text-gray-600">Leads</div>
                    </div>

                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">€{channel.cost_per_lead.toFixed(0)}</div>
                      <div className="text-xs text-gray-600">Costo/Lead</div>
                    </div>
                  </div>

                  {/* Barra de performance */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Performance vs Promedio</span>
                      <span>{channel.roi > roiAnalytics.overallROI ? '+' : ''}{(channel.roi - roiAnalytics.overallROI).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          channel.roi > roiAnalytics.overallROI ? 'bg-green-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min((channel.roi / Math.max(...roiAnalytics.channelROI.map(c => c.roi))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendencias mensuales */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Evolución Mensual del ROI</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={roiAnalytics.monthlyROI}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="investment" orientation="left" />
              <YAxis yAxisId="roi" orientation="right" />
              <Tooltip />
              <Bar dataKey="investment" fill="#3b82f6" name="Inversión €" />
              <Bar dataKey="revenue" fill="#10b981" name="Ingresos €" />
              <Line 
                yAxisId="roi"
                type="monotone" 
                dataKey="roi" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="ROI %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights y proyecciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 ROI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border-l-4 border-green-400">
                <p className="text-sm text-green-800">
                  <strong>Mejor Canal:</strong> {
                    roiAnalytics.channelROI.sort((a, b) => b.roi - a.roi)[0]?.channel
                  } genera {
                    roiAnalytics.channelROI.sort((a, b) => b.roi - a.roi)[0]?.roi
                  }% de ROI.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Eficiencia de Costos:</strong> {
                    roiAnalytics.channelROI.sort((a, b) => a.cost_per_lead - b.cost_per_lead)[0]?.channel
                  } tiene el menor costo por lead (€{
                    roiAnalytics.channelROI.sort((a, b) => a.cost_per_lead - b.cost_per_lead)[0]?.cost_per_lead.toFixed(0)
                  }).
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 border-l-4 border-orange-400">
                <p className="text-sm text-orange-800">
                  <strong>Tendencia:</strong> El ROI promedio de los últimos 3 meses es {
                    roiAnalytics.monthlyROI.slice(-3).reduce((sum, m) => sum + m.roi, 0) / 3
                  }%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💡 Recomendaciones de Inversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-green-100 text-green-800">AUMENTAR</Badge>
                <div>
                  <h4 className="font-semibold text-sm">
                    {roiAnalytics.channelROI.sort((a, b) => b.roi - a.roi)[0]?.channel}
                  </h4>
                  <p className="text-xs text-gray-600">
                    Mayor ROI ({roiAnalytics.channelROI.sort((a, b) => b.roi - a.roi)[0]?.roi}%) - Aumentar inversión
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-orange-100 text-orange-800">OPTIMIZAR</Badge>
                <div>
                  <h4 className="font-semibold text-sm">
                    {roiAnalytics.channelROI.sort((a, b) => a.roi - b.roi)[0]?.channel}
                  </h4>
                  <p className="text-xs text-gray-600">
                    Menor ROI ({roiAnalytics.channelROI.sort((a, b) => a.roi - b.roi)[0]?.roi}%) - Necesita optimización
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-blue-100 text-blue-800">MANTENER</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Balance Actual</h4>
                  <p className="text-xs text-gray-600">
                    ROI general de {roiAnalytics.overallROI}% está por encima del promedio de la industria
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ROIAnalyticsTab;
