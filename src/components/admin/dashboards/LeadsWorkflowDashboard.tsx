
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Target, Users, TrendingUp, Clock, CheckCircle, Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import RealTimeLeadsDashboard from '../leads/RealTimeLeadsDashboard';
import ProspectsDashboard from '../dashboard/ProspectsDashboard';

const LeadsWorkflowDashboard = () => {
  // Mock data - en producción vendría de tus hooks
  const stats = {
    hotLeads: 23,
    totalLeads: 156,
    conversionRate: 15.4,
    urgentAlerts: 5,
    meetingsScheduled: 8,
    responseTime: 2.3
  };

  const urgentLeads = [
    { id: 1, company: "TechCorp SA", score: 95, lastActivity: "2 min", priority: "critical" },
    { id: 2, company: "InnovateLab", score: 88, lastActivity: "15 min", priority: "high" },
    { id: 3, company: "DataSystems", score: 82, lastActivity: "1 hora", priority: "high" }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-700';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-700';
      default: return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎯 LEADS & WORKFLOWS</h1>
          <p className="text-gray-600 mt-1">Gestión completa del proceso desde lead hasta reunión conseguida</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <NavLink to="/admin/lead-scoring">Ir a Lead Scoring</NavLink>
          </Button>
          <Button asChild>
            <NavLink to="/admin/marketing-automation">Automatización</NavLink>
          </Button>
        </div>
      </div>

      {/* Alertas Urgentes */}
      {stats.urgentAlerts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              ¡ACCIÓN INMEDIATA REQUERIDA!
              <Badge variant="destructive">{stats.urgentAlerts} alertas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentLeads.map((lead) => (
                <div key={lead.id} className={`flex items-center justify-between p-3 rounded-lg border-2 ${getPriorityColor(lead.priority)}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-semibold">{lead.company}</div>
                      <div className="text-sm opacity-75">Score: {lead.score} • Última actividad: {lead.lastActivity}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="destructive">
                    CONTACTAR AHORA
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs principales */}
      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="realtime">🔴 Tiempo Real</TabsTrigger>
          <TabsTrigger value="prospects">📊 Prospectos</TabsTrigger>
          <TabsTrigger value="pipeline">📈 Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <RealTimeLeadsDashboard />
        </TabsContent>

        <TabsContent value="prospects" className="space-y-4">
          <ProspectsDashboard />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Leads Calientes</p>
                    <p className="text-2xl font-bold text-red-600">{stats.hotLeads}</p>
                  </div>
                  <Target className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold">{stats.totalLeads}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa Conversión</p>
                    <p className="text-2xl font-bold text-green-600">{stats.conversionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reuniones</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.meetingsScheduled}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.urgentAlerts}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tiempo Resp.</p>
                    <p className="text-2xl font-bold text-cyan-600">{stats.responseTime}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Visual */}
          <Card>
            <CardHeader>
              <CardTitle>🔄 Pipeline de Conversión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-gray-600">Leads Totales</div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">23</div>
                  <div className="text-sm text-gray-600">Leads Calientes</div>
                  <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600">15</div>
                  <div className="text-sm text-gray-600">Contactados</div>
                  <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600">8</div>
                  <div className="text-sm text-gray-600">Reuniones</div>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">3</div>
                  <div className="text-sm text-gray-600">Clientes</div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Tasa de Conversión General: {stats.conversionRate}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadsWorkflowDashboard;
