import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  Search,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CampaignActionsDropdown } from './CampaignActionsDropdown';

interface Campaign {
  id: string;
  subject: string;
  operations_included: string[];
  recipients_count: number;
  sent_at: string | null;
  status: string;
  open_count: number;
  click_count: number;
  created_at: string;
  sent_via?: string | null;
  notes?: string | null;
  html_content?: string | null;
  intro_text?: string | null;
}

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  geographic_location: string | null;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  short_description: string | null;
  project_status: string;
}

interface CampaignHistoryProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onRefresh: () => void;
  operations?: Operation[];
  onDuplicate?: (campaign: Campaign) => void;
}

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    sent: { label: "Enviado", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
    sending: { label: "Enviando", variant: "secondary", icon: <Send className="h-3 w-3 animate-pulse" /> },
    draft: { label: "Borrador", variant: "outline", icon: <Clock className="h-3 w-3" /> },
    failed: { label: "Error", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
    scheduled: { label: "Programado", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  };
  const { label, variant, icon } = config[status] || config.draft;
  return (
    <Badge variant={variant} className="gap-1">
      {icon}
      {label}
    </Badge>
  );
}

function getSentViaBadge(sentVia: string | null | undefined) {
  if (sentVia === 'brevo') {
    return (
      <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700 border-purple-200">
        <Mail className="h-3 w-3" />
        Brevo
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Send className="h-3 w-3" />
      Interno
    </Badge>
  );
}

export const CampaignHistory: React.FC<CampaignHistoryProps> = ({ 
  campaigns, 
  isLoading, 
  onRefresh,
  operations = [],
  onDuplicate,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    // Status filter
    if (statusFilter !== 'all' && campaign.status !== statusFilter) return false;
    
    // Origin filter
    if (originFilter !== 'all') {
      const campaignOrigin = campaign.sent_via || 'internal';
      if (originFilter !== campaignOrigin) return false;
    }
    
    // Search filter
    if (searchQuery && !campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Campañas</CardTitle>
          <CardDescription>Newsletters enviados anteriormente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Campañas</CardTitle>
        <CardDescription>
          {filteredCampaigns.length} de {campaigns.length} campañas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por asunto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="sent">Enviados</SelectItem>
              <SelectItem value="failed">Fallidos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={originFilter} onValueChange={setOriginFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Origen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="brevo">Brevo</SelectItem>
              <SelectItem value="internal">Interno</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredCampaigns.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead className="text-center">Origen</TableHead>
                  <TableHead className="text-center">Ops</TableHead>
                  <TableHead className="text-center">Enviados</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[120px]">Notas</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="whitespace-nowrap">
                      {campaign.sent_at 
                        ? format(new Date(campaign.sent_at), "d MMM yyyy", { locale: es })
                        : format(new Date(campaign.created_at), "d MMM yyyy", { locale: es })
                      }
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {campaign.subject}
                    </TableCell>
                    <TableCell className="text-center">
                      {getSentViaBadge(campaign.sent_via)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{campaign.operations_included?.length || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {campaign.recipients_count}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(campaign.status)}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate text-sm text-muted-foreground">
                      {campaign.notes || '—'}
                    </TableCell>
                    <TableCell>
                      <CampaignActionsDropdown 
                        campaign={campaign}
                        onRefresh={onRefresh}
                        onDuplicate={onDuplicate}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay campañas que coincidan</p>
            <p className="text-sm">Prueba ajustando los filtros</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
