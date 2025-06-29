
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadScoringAnalytics, MarketingMetrics } from '@/types/marketingHub';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Target, TrendingUp, Users, Flame } from 'lucide-react';

interface LeadScoringHubTabProps {
  leadScoringAnalytics?: LeadScoringAnalytics;
  marketingMetrics?: MarketingMetrics;
}

const LeadScoringHubTab = ({ leadScoringAnalytics, marketingMetrics }: LeadScoringHubTabProps) => {
  if (!leadScoringAnalytics || !marketingMetrics) {
    return <div>Cargando datos de lead scoring...</div>;
  }

  const distributionData = [
    { name: 'Cold (0-40)', value: leadScoringAnalytics.scoreDistribution.cold, color: '#3b82f6' },
    { name: 'Warm (41-70)', value: leadScoringAnalytics.scoreDistribution.warm, color: '#f59e0b' },
    { name: 'Hot (71-100)', value: leadScoringAnalytics.scoreDistribution.hot, color: '#ef4444' }
  ];

  const industryData = Object.entries(leadScoringAnalytics.averageScoreByIndustry).map(([industry, score]) => ({
    industry: industry.length > 15 ? industry.substring(0, 15) + '...' : industry,
    score
  }));

  return (
    <div className="space-y-6">
      {/* KPIs de Lead Scoring */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Promedio</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{marketingMetrics.averageLeadScore}</div>
            <p className="text-xs text-gray-600">puntos de 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Prospects</CardTitle>
            <Flame className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{marketingMetrics.hotProspects}</div>
            <p className="text-xs text-gray-600">score {'>'} 80</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Calificados</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{marketingMetrics.qualifiedLeads}</div>
            <p className="text-xs text-gray-600">score {'>'} 50</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Calificación</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {marketingMetrics.totalLeads > 0 ? ((marketingMetrics.qualifiedLeads / marketingMetrics.totalLeads) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-gray-600">leads calificados</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de Scores */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Distribución de Lead Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {leadScoringAnalytics.scoreDistribution.cold}
                </div>
                <div className="text-xs text-gray-500">Cold Leads</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {leadScoringAnalytics.scoreDistribution.warm}
                </div>
                <div className="text-xs text-gray-500">Warm Leads</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {leadScoringAnalytics.scoreDistribution.hot}
                </div>
                <div className="text-xs text-gray-500">Hot Leads</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score por Industria */}
        <Card>
          <CardHeader>
            <CardTitle>🏭 Score Promedio por Industria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={industryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="industry" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias de Scoring */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Tendencias de Lead Scoring (Últimos 30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={leadScoringAnalytics.scoringTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="score" orientation="left" />
              <YAxis yAxisId="leads" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="score"
                type="monotone" 
                dataKey="average_score" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Score Promedio"
              />
              <Line 
                yAxisId="leads"
                type="monotone" 
                dataKey="hot_leads" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Hot Leads"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights y Recomendaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🎯 Lead Scoring Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border-l-4 border-red-400">
                <p className="text-sm text-red-800">
                  <strong>Oportunidad Inmediata:</strong> Tienes {marketingMetrics.hotProspects} hot prospects 
                  que requieren contacto inmediato del equipo comercial.
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 border-l-4 border-orange-400">
                <p className="text-sm text-orange-800">
                  <strong>Nurturing Priority:</strong> {leadScoringAnalytics.scoreDistribution.warm} leads 
                  en zona warm necesitan nurturing específico para convertir.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Mejor Industria:</strong> {
                    Object.entries(leadScoringAnalytics.averageScoreByIndustry)
                      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                  } tiene el score promedio más alto ({
                    Object.entries(leadScoringAnalytics.averageScoreByIndustry)
                      .sort(([,a], [,b]) => b - a)[0]?.[1] || 0
                  } puntos).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚡ Acciones Recomendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Contactar Hot Prospects</h4>
                  <p className="text-xs text-gray-600">
                    {marketingMetrics.hotProspects} leads con score {'>'} 80 necesitan contacto inmediato
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-orange-100 text-orange-800">HIGH</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Secuencias de Nurturing</h4>
                  <p className="text-xs text-gray-600">
                    Activar campañas específicas para {leadScoringAnalytics.scoreDistribution.warm} warm leads
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-blue-100 text-blue-800">MEDIUM</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Optimizar Reglas</h4>
                  <p className="text-xs text-gray-600">
                    Revisar reglas de scoring para industrias con bajo rendimiento
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-green-100 text-green-800">LOW</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Contenido Específico</h4>
                  <p className="text-xs text-gray-600">
                    Crear contenido para cold leads en industrias específicas
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

export default LeadScoringHubTab;
