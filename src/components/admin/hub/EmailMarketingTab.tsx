
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmailMarketingMetrics } from '@/types/marketingHub';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { Mail, MousePointer, Eye, Target, TrendingUp } from 'lucide-react';

interface EmailMarketingTabProps {
  emailMetrics?: EmailMarketingMetrics;
}

const EmailMarketingTab = ({ emailMetrics }: EmailMarketingTabProps) => {
  if (!emailMetrics) {
    return <div>Cargando métricas de email marketing...</div>;
  }

  // Calcular métricas generales
  const totalSent = emailMetrics.campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalOpened = emailMetrics.campaigns.reduce((sum, c) => sum + c.opened, 0);
  const totalClicked = emailMetrics.campaigns.reduce((sum, c) => sum + c.clicked, 0);
  const totalConverted = emailMetrics.campaigns.reduce((sum, c) => sum + c.converted, 0);
  const totalROI = emailMetrics.campaigns.reduce((sum, c) => sum + c.roi, 0);

  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const avgClickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
  const avgConversionRate = totalSent > 0 ? (totalConverted / totalSent) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-gray-600">total campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">{totalOpened.toLocaleString()} aperturas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgClickRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">{totalClicked.toLocaleString()} clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{avgConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">{totalConverted} conversiones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalROI}%</div>
            <p className="text-xs text-gray-600">return on investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance de Campañas */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Performance de Campañas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emailMetrics.campaigns.map((campaign, index) => (
              <div key={campaign.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-gray-500">{campaign.sent.toLocaleString()} emails enviados</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{campaign.roi}%</div>
                    <div className="text-sm text-gray-500">ROI</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{campaign.open_rate}%</div>
                    <div className="text-xs text-gray-600">Open Rate</div>
                    <div className="text-xs text-gray-500">{campaign.opened} aperturas</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{campaign.click_rate}%</div>
                    <div className="text-xs text-gray-600">Click Rate</div>
                    <div className="text-xs text-gray-500">{campaign.clicked} clicks</div>
                  </div>

                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">{campaign.conversion_rate}%</div>
                    <div className="text-xs text-gray-600">Conversion</div>
                    <div className="text-xs text-gray-500">{campaign.converted} conversiones</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{campaign.roi}%</div>
                    <div className="text-xs text-gray-600">ROI</div>
                    <div className="text-xs text-gray-500">return on investment</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Secuencias de Email */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🔄 Secuencias Automáticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emailMetrics.sequences.map((sequence) => (
                <div key={sequence.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{sequence.name}</h3>
                    <Badge variant="outline">
                      {sequence.completion_rate.toFixed(1)}% completion
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Inscritos:</span>
                      <span className="font-semibold ml-2">{sequence.total_enrolled}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Completados:</span>
                      <span className="font-semibold ml-2 text-green-600">{sequence.completed}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Open:</span>
                      <span className="font-semibold ml-2">{sequence.avg_open_rate.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Click:</span>
                      <span className="font-semibold ml-2">{sequence.avg_click_rate.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${sequence.completion_rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparativo de métricas */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Comparativo de Campañas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emailMetrics.campaigns} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="open_rate" fill="#3b82f6" name="Open Rate %" />
                <Bar dataKey="click_rate" fill="#8b5cf6" name="Click Rate %" />
                <Bar dataKey="conversion_rate" fill="#f59e0b" name="Conversion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights y Recomendaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>💡 Email Marketing Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border-l-4 border-green-400">
                <p className="text-sm text-green-800">
                  <strong>Best Performer:</strong> {
                    emailMetrics.campaigns.sort((a, b) => b.roi - a.roi)[0]?.name
                  } tiene el ROI más alto ({
                    emailMetrics.campaigns.sort((a, b) => b.roi - a.roi)[0]?.roi
                  }%).
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Open Rate Benchmark:</strong> Tu promedio ({avgOpenRate.toFixed(1)}%) está 
                  {avgOpenRate > 25 ? ' por encima' : ' por debajo'} del estándar de la industria (25%).
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 border-l-4 border-orange-400">
                <p className="text-sm text-orange-800">
                  <strong>Oportunidad:</strong> Las secuencias automáticas tienen una tasa de completación promedio 
                  del {emailMetrics.sequences.reduce((sum, s) => sum + s.completion_rate, 0) / emailMetrics.sequences.length}%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Recomendaciones de Optimización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-red-100 text-red-800">HIGH</Badge>
                <div>
                  <h4 className="font-semibold text-sm">A/B Test Subject Lines</h4>
                  <p className="text-xs text-gray-600">
                    Prueba diferentes subject lines para mejorar el open rate
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-orange-100 text-orange-800">MEDIUM</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Segmentación Avanzada</h4>
                  <p className="text-xs text-gray-600">
                    Segmenta por industria/comportamiento para mayor relevancia
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-blue-100 text-blue-800">MEDIUM</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Optimizar Timing</h4>
                  <p className="text-xs text-gray-600">
                    Analiza las mejores horas/días para envío por segmento
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-green-100 text-green-800">LOW</Badge>
                <div>
                  <h4 className="font-semibold text-sm">Personalización Dinámica</h4>
                  <p className="text-xs text-gray-600">
                    Incluye más contenido personalizado basado en comportamiento
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

export default EmailMarketingTab;
