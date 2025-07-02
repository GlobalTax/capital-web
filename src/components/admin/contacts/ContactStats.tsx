import React from 'react';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Star, 
  TrendingUp, 
  Mail,
  Building,
  Globe,
  Phone,
  Calendar
} from 'lucide-react';

interface ContactStatsProps {
  contacts: UnifiedContact[];
}

export const ContactStats: React.FC<ContactStatsProps> = ({ contacts }) => {
  // Calculate stats
  const totalContacts = contacts.length;
  const hotLeads = contacts.filter(c => c.is_hot_lead || (c.score || 0) >= 80).length;
  const newContacts = contacts.filter(c => c.status === 'new').length;
  const opportunities = contacts.filter(c => c.status === 'opportunity').length;
  const customers = contacts.filter(c => c.status === 'customer').length;
  
  // Source distribution
  const sourceStats = {
    contact_lead: contacts.filter(c => c.source === 'contact_lead').length,
    apollo: contacts.filter(c => c.source === 'apollo').length,
    lead_score: contacts.filter(c => c.source === 'lead_score').length
  };

  // Status distribution
  const statusStats = {
    new: contacts.filter(c => c.status === 'new').length,
    contacted: contacts.filter(c => c.status === 'contacted').length,
    qualified: contacts.filter(c => c.status === 'qualified').length,
    opportunity: contacts.filter(c => c.status === 'opportunity').length,
    customer: contacts.filter(c => c.status === 'customer').length,
    lost: contacts.filter(c => c.status === 'lost').length
  };

  // Industry distribution (top 5)
  const industryMap = contacts.reduce((acc, contact) => {
    if (contact.industry) {
      acc[contact.industry] = (acc[contact.industry] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topIndustries = Object.entries(industryMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Average score
  const scoresWithValues = contacts.filter(c => c.score !== undefined);
  const avgScore = scoresWithValues.length > 0 
    ? scoresWithValues.reduce((sum, c) => sum + (c.score || 0), 0) / scoresWithValues.length 
    : 0;

  // Recent contacts (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentContacts = contacts.filter(c => new Date(c.created_at) >= weekAgo).length;

  const conversionRate = totalContacts > 0 ? (customers / totalContacts) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Total Contactos
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {totalContacts}
                </p>
                <p className="text-xs text-green-600">
                  +{recentContacts} esta semana
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Leads Calientes
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {hotLeads}
                </p>
                <p className="text-xs text-admin-text-secondary">
                  {totalContacts > 0 ? ((hotLeads / totalContacts) * 100).toFixed(1) : 0}% del total
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Puntuación Media
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {avgScore.toFixed(0)}
                </p>
                <Progress value={avgScore} className="w-16 h-2 mt-1" />
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
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
                  {conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-admin-text-secondary">
                  {customers} clientes
                </p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribución por Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {status === 'new' ? 'Nuevo' :
                     status === 'contacted' ? 'Contactado' :
                     status === 'qualified' ? 'Calificado' :
                     status === 'opportunity' ? 'Oportunidad' :
                     status === 'customer' ? 'Cliente' : 'Perdido'}
                  </span>
                  <span className="text-sm text-admin-text-secondary">
                    {count} ({totalContacts > 0 ? ((count / totalContacts) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <Progress 
                  value={totalContacts > 0 ? (count / totalContacts) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Distribución por Fuente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Formulario Web</span>
                <span className="text-sm text-admin-text-secondary">
                  {sourceStats.contact_lead} ({totalContacts > 0 ? ((sourceStats.contact_lead / totalContacts) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <Progress 
                value={totalContacts > 0 ? (sourceStats.contact_lead / totalContacts) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Apollo</span>
                <span className="text-sm text-admin-text-secondary">
                  {sourceStats.apollo} ({totalContacts > 0 ? ((sourceStats.apollo / totalContacts) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <Progress 
                value={totalContacts > 0 ? (sourceStats.apollo / totalContacts) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Web Tracking</span>
                <span className="text-sm text-admin-text-secondary">
                  {sourceStats.lead_score} ({totalContacts > 0 ? ((sourceStats.lead_score / totalContacts) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <Progress 
                value={totalContacts > 0 ? (sourceStats.lead_score / totalContacts) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Industries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Top Industrias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topIndustries.length > 0 ? (
              topIndustries.map(([industry, count]) => (
                <div key={industry} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{industry}</span>
                    <span className="text-sm text-admin-text-secondary">
                      {count} ({totalContacts > 0 ? ((count / totalContacts) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <Progress 
                    value={totalContacts > 0 ? (count / totalContacts) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              ))
            ) : (
              <p className="text-admin-text-secondary text-center py-4">
                No hay datos de industria disponibles
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-bold text-admin-text-primary">
                  {recentContacts}
                </div>
                <div className="text-xs text-admin-text-secondary">
                  Nuevos (7 días)
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-lg font-bold text-admin-text-primary">
                  {newContacts}
                </div>
                <div className="text-xs text-admin-text-secondary">
                  Por contactar
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-admin-text-secondary text-center">
                🎯 {hotLeads} leads calientes necesitan atención inmediata
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};