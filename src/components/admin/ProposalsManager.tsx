import React, { useState } from 'react';
import { useProposals } from '@/hooks/useProposals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  Send, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Euro,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { ProposalsTable } from './proposals/ProposalsTable';
import { ProposalForm } from './proposals/ProposalForm';
import { ProposalStats } from './proposals/ProposalStats';
import { ProposalTemplates } from './proposals/ProposalTemplates';

export const ProposalsManager = () => {
  const { proposals, templates, stats, isLoading } = useProposals();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text-primary">
            Propuestas de Honorarios
          </h1>
          <p className="text-admin-text-secondary">
            Gestiona y haz seguimiento de todas las propuestas comerciales
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Propuesta
        </Button>
      </div>

      {/* Quick Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-admin-text-secondary">
                    Total Propuestas
                  </p>
                  <p className="text-2xl font-bold text-admin-text-primary">
                    {stats.total_proposals}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-admin-text-secondary">
                    Tasa Conversión
                  </p>
                  <p className="text-2xl font-bold text-admin-text-primary">
                    {stats.conversion_rate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-admin-text-secondary">
                    Valor Total
                  </p>
                  <p className="text-2xl font-bold text-admin-text-primary">
                    €{stats.total_value.toLocaleString()}
                  </p>
                </div>
                <Euro className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-admin-text-secondary">
                    Tiempo Respuesta
                  </p>
                  <p className="text-2xl font-bold text-admin-text-primary">
                    {stats.avg_response_time.toFixed(0)}d
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="proposals">Propuestas</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Proposals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Propuestas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proposals.slice(0, 5).map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-admin-text-primary">
                          {proposal.proposal_title}
                        </p>
                        <p className="text-sm text-admin-text-secondary">
                          {proposal.client_name} • {proposal.client_company}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          proposal.status === 'approved' ? 'default' :
                          proposal.status === 'sent' ? 'secondary' :
                          proposal.status === 'viewed' ? 'outline' : 'secondary'
                        }>
                          {proposal.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {proposal.status === 'sent' && <Send className="h-3 w-3 mr-1" />}
                          {proposal.status === 'viewed' && <Eye className="h-3 w-3 mr-1" />}
                          {proposal.status === 'draft' && <FileText className="h-3 w-3 mr-1" />}
                          {proposal.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Templates Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plantillas Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.slice(0, 5).map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-admin-text-primary">
                          {template.name}
                        </p>
                        <p className="text-sm text-admin-text-secondary">
                          {template.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-admin-text-primary">
                          {template.base_fee_percentage}%
                        </p>
                        <p className="text-xs text-admin-text-secondary">
                          Min: €{template.minimum_fee.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="proposals">
          <ProposalsTable />
        </TabsContent>

        <TabsContent value="templates">
          <ProposalTemplates />
        </TabsContent>

        <TabsContent value="analytics">
          <ProposalStats />
        </TabsContent>
      </Tabs>

      {/* Create Proposal Modal */}
      {showCreateForm && (
        <ProposalForm 
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

export default ProposalsManager;