
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMarketingIntelligence } from '@/hooks/useMarketingIntelligence';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Target, 
  Building2, 
  Activity,
  BarChart3,
  Zap,
  Calendar,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

const MarketingIntelligenceDashboard = () => {
  const { 
    companies, 
    events, 
    summary, 
    isLoading, 
    trackEvent,
    getLeadScore,
    getTopCompanies 
  } = useMarketingIntelligence();

  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const topCompanies = getTopCompanies(5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Marketing Intelligence Platform
          </h1>
          <p className="text-gray-600 mt-2">
            Análisis avanzado de visitantes empresariales y leads de alta calidad
          </p>
        </div>
        
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Identificadas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalCompanies || 0}</div>
            <p className="text-xs text-muted-foreground">
              +8% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads de Alta Calidad</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.leadScore?.high || 0}</div>
            <p className="text-xs text-muted-foreground">
              Score ≥ 70 puntos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <p className="text-xs text-muted-foreground">
              +3.2% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">Empresas Visitantes</TabsTrigger>
          <TabsTrigger value="events">Actividad en Tiempo Real</TabsTrigger>
          <TabsTrigger value="insights">Insights & Predicciones</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Companies */}
            <Card>
              <CardHeader>
                <CardTitle>Top Empresas por Lead Score</CardTitle>
                <CardDescription>
                  Empresas con mayor potencial de conversión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCompanies.map((company, index) => {
                    const leadScore = getLeadScore(company.domain);
                    const scoreColor = leadScore >= 70 ? 'bg-green-500' : 
                                     leadScore >= 40 ? 'bg-yellow-500' : 'bg-red-500';
                    
                    return (
                      <div key={company.domain} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{company.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {company.industry}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {company.visitCount} visitas • {company.pages.length} páginas
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${scoreColor}`}>
                            {leadScore}/100
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(company.lastVisit, 'dd/MM HH:mm')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Lead Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Lead Score</CardTitle>
                <CardDescription>
                  Segmentación por calidad de leads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Alta Calidad (70-100)</span>
                    </div>
                    <span className="font-medium">{summary?.leadScore?.high || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Media Calidad (40-69)</span>
                    </div>
                    <span className="font-medium">{summary?.leadScore?.medium || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Baja Calidad (0-39)</span>
                    </div>
                    <span className="font-medium">{summary?.leadScore?.low || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad en Tiempo Real</CardTitle>
              <CardDescription>
                Eventos y interacciones recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary?.recentActivity?.map((event: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-gray-500">
                        {event.properties?.page_path || 'N/A'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(event.timestamp), 'HH:mm:ss')}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    No hay actividad reciente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Insights Automáticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800">
                      🎯 Oportunidad Detectada
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      3 empresas de tecnología con alta puntuación visitaron la página de servicios en las últimas 24h
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800">
                      📈 Tendencia Positiva
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      El tiempo de engagement ha aumentado 25% esta semana
                    </div>
                  </div>
                  
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="font-medium text-orange-800">
                      ⚠️ Atención Requerida
                    </div>
                    <div className="text-sm text-orange-600 mt-1">
                      La página de contacto tiene una alta tasa de abandono (45%)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Acciones Recomendadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium">Contactar Empresa Demo S.L.</div>
                      <div className="text-sm text-gray-500">Lead score: 85 • Última visita: hace 2h</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium">Optimizar página de contacto</div>
                      <div className="text-sm text-gray-500">Reducir tasa de abandono del 45%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium">Crear contenido sector tecnología</div>
                      <div className="text-sm text-gray-500">Alto interés detectado en este sector</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Analytics</CardTitle>
              <CardDescription>
                Configura las integraciones de terceros para datos completos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Google Analytics 4</div>
                      <div className="text-sm text-gray-500">ID: G-XXXXXXXXXX</div>
                    </div>
                    <Badge variant="outline">Configurar</Badge>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Microsoft Clarity</div>
                      <div className="text-sm text-gray-500">ID: XXXXXXXXXX</div>
                    </div>
                    <Badge variant="outline">Configurar</Badge>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Leadfeeder / Company Intelligence</div>
                      <div className="text-sm text-gray-500">ID: XXXXXXXXXX</div>
                    </div>
                    <Badge variant="outline">Configurar</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingIntelligenceDashboard;
