
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMarketingAutomation } from '@/hooks/useMarketingAutomation';
import EmailSequencesManager from './automation/EmailSequencesManager';
import ABTestingManager from './automation/ABTestingManager';
import WorkflowsManager from './automation/WorkflowsManager';
import AutomationAnalytics from './automation/AutomationAnalytics';
import { Mail, TestTube, Workflow, BarChart3, Play, Pause, Settings } from 'lucide-react';

const MarketingAutomationDashboard = () => {
  const {
    emailSequences,
    abTests,
    workflows,
    isLoadingSequences,
    isLoadingABTests,
    isLoadingWorkflows
  } = useMarketingAutomation();

  const [activeTab, setActiveTab] = useState('overview');

  if (isLoadingSequences || isLoadingABTests || isLoadingWorkflows) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando Marketing Automation...</p>
        </div>
      </div>
    );
  }

  const activeSequences = emailSequences?.filter(seq => seq.is_active).length || 0;
  const activeTests = abTests?.filter(test => test.is_active).length || 0;
  const activeWorkflows = workflows?.filter(wf => wf.is_active).length || 0;
  const totalExecutions = workflows?.reduce((sum, wf) => sum + wf.execution_count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Workflow className="h-8 w-8 text-purple-600" />
            Marketing Automation
          </h1>
          <p className="text-gray-600 mt-1">
            Sistema completo de automatización de marketing y nurturing de leads
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Secuencias Activas</p>
                <p className="text-2xl font-bold text-blue-600">{activeSequences}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">A/B Tests Activos</p>
                <p className="text-2xl font-bold text-green-600">{activeTests}</p>
              </div>
              <TestTube className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Workflows Activos</p>
                <p className="text-2xl font-bold text-purple-600">{activeWorkflows}</p>
              </div>
              <Workflow className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ejecuciones</p>
                <p className="text-2xl font-bold text-orange-600">{totalExecutions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Últimas Secuencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emailSequences?.slice(0, 5).map((sequence) => (
                <div key={sequence.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sequence.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{sequence.trigger_type}</p>
                  </div>
                  <Badge variant={sequence.is_active ? "default" : "secondary"}>
                    {sequence.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No hay secuencias configuradas
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-green-500" />
              Tests A/B Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {abTests?.slice(0, 5).map((test) => (
                <div key={test.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{test.test_name}</p>
                    <p className="text-sm text-gray-500">{test.page_path}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.winner_variant && (
                      <Badge variant="outline">Ganador: {test.winner_variant}</Badge>
                    )}
                    <Badge variant={test.is_active ? "default" : "secondary"}>
                      {test.is_active ? 'Activo' : 'Finalizado'}
                    </Badge>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No hay tests A/B configurados
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-purple-500" />
              Workflows Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflows?.filter(wf => wf.is_active).slice(0, 5).map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{workflow.name}</p>
                    <p className="text-sm text-gray-500">{workflow.execution_count} ejecuciones</p>
                  </div>
                  <Badge variant="default">
                    <Play className="h-3 w-3 mr-1" />
                    Activo
                  </Badge>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No hay workflows activos
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sequences">
            <Mail className="h-4 w-4 mr-2" />
            Secuencias Email
          </TabsTrigger>
          <TabsTrigger value="abtesting">
            <TestTube className="h-4 w-4 mr-2" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Workflow className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sequences">
          <EmailSequencesManager />
        </TabsContent>

        <TabsContent value="abtesting">
          <ABTestingManager />
        </TabsContent>

        <TabsContent value="workflows">
          <WorkflowsManager />
        </TabsContent>

        <TabsContent value="analytics">
          <AutomationAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingAutomationDashboard;
